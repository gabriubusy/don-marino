import { v4 as uuidv4 } from 'uuid';
import { supabase, createReminder, createConversation, createIntent, createMessage } from './supabase';
import { ChatResponse } from './types';
import { saveLocalReminder, ReminderItem } from './localStorage';
import nlp from 'compromise';
// @ts-ignore - Plugin types are not properly defined
import dates from 'compromise-dates';
import * as tf from '@tensorflow/tfjs';
import { load as loadUSE } from '@tensorflow-models/universal-sentence-encoder';

// Register compromise plugins
// @ts-ignore - Plugin registration has type issues
nlp.extend(dates);

// In-memory cache for the Universal Sentence Encoder model
let useModel: any = null;
let useModelLoading = false;
let intentEmbeddings: {[key: string]: Float32Array} = {};

// Intent examples for training the model
const INTENT_EXAMPLES = {
  CREATE_REMINDER: [
    "Recuérdame comprar leche mañana",
    "Crear un recordatorio para la reunión del lunes",
    "Nueva tarea para el jueves",
    "Agendar cita con el médico el 15 de agosto",
    "Recordatorio para pagar las facturas el 30",
    "Programa una alarma para mañana a las 9",
    "Necesito que me recuerdes llamar a mamá esta tarde",
    "Anota que tengo que recoger el paquete el viernes"
  ],
  LIST_REMINDERS: [
    "Ver mis recordatorios",
    "Mostrar mis tareas pendientes",
    "Listar todos los recordatorios",
    "¿Qué recordatorios tengo para hoy?",
    "Muéstrame mis tareas de esta semana",
    "¿Cuáles son mis próximos recordatorios?",
    "Necesito ver todas mis tareas"
  ],
  GREETING: [
    "Hola",
    "Buenos días",
    "Buenas tardes",
    "Buenas noches",
    "Qué tal",
    "Cómo estás",
    "Saludos",
    "Hey"
  ],
  FAREWELL: [
    "Adiós",
    "Hasta luego",
    "Chao",
    "Nos vemos",
    "Hasta pronto",
    "Hasta mañana",
    "Me voy"
  ],
  THANKS: [
    "Gracias",
    "Muchas gracias",
    "Te lo agradezco",
    "Gracias por tu ayuda"
  ],
  WEATHER: [
    "¿Qué tiempo hace hoy?",
    "¿Va a llover?",
    "¿Cuál es el pronóstico del clima?",
    "¿Cómo está el día afuera?",
    "¿Hace frío?",
    "¿Hace calor?"
  ],
  SMALL_TALK: [
    "¿Cómo te llamas?",
    "¿Quién eres?",
    "Cuéntame sobre ti",
    "¿Eres un robot?",
    "¿Eres inteligente?",
    "¿Dónde vives?",
    "¿Qué haces en tu tiempo libre?",
    "¿Tienes sentimientos?",
    "¿Puedes pensar?"
  ],
  JOKES: [
    "Cuéntame un chiste",
    "Dime algo gracioso",
    "Hazme reír",
    "¿Sabes algún chiste?",
    "Necesito reírme un poco"
  ],
  TIME_DATE: [
    "¿Qué hora es?",
    "¿Qué día es hoy?",
    "¿En qué fecha estamos?",
    "¿Cuánto falta para el fin de semana?",
    "¿Qué día cae el próximo lunes?"
  ],
  ACTIVITIES_INFO: [
    "¿Qué actividades hay disponibles?",
    "Cuéntame sobre las actividades",
    "Información sobre actividades",
    "¿Qué puedo reservar?",
    "¿Qué opciones de actividades tienen?"
  ],
  RESERVATIONS_HELP: [
    "¿Cómo hago una reservación?",
    "¿Cómo reservo una actividad?",
    "Ayuda con reservaciones",
    "Quiero reservar algo",
    "Proceso de reserva"
  ],
  HELP: [
    "Ayuda",
    "¿Cómo funcionas?",
    "¿Qué puedes hacer?",
    "¿Para qué sirves?",
    "Dame instrucciones",
    "¿Qué comandos entiendes?",
    "No sé cómo usarte"
  ]
};

// Initialize the Universal Sentence Encoder model
async function initializeUseModel() {
  if (!useModel && !useModelLoading) {
    useModelLoading = true;
    try {
      // Load model from TF.js
      useModel = await loadUSE();
      console.log("Universal Sentence Encoder model loaded successfully");
      
      // Create embeddings for our intent examples
      await createIntentEmbeddings();
      
    } catch (error) {
      console.error("Error loading Universal Sentence Encoder model:", error);
    } finally {
      useModelLoading = false;
    }
  }
  return useModel;
}

// Create embeddings for our intent examples
async function createIntentEmbeddings() {
  if (!useModel) return;
  
  // Prepare all examples for embedding
  const allExamples: string[] = [];
  const intentMapping: {[index: number]: string} = {};
  
  let index = 0;
  for (const [intent, examples] of Object.entries(INTENT_EXAMPLES)) {
    for (const example of examples) {
      allExamples.push(example);
      intentMapping[index] = intent;
      index++;
    }
  }
  
  // Get embeddings for all examples
  const embeddings = await useModel.embed(allExamples);
  const embeddingArray = await embeddings.array();
  
  // Organize embeddings by intent
  for (let i = 0; i < embeddingArray.length; i++) {
    const intent = intentMapping[i];
    if (!intentEmbeddings[intent]) {
      intentEmbeddings[intent] = embeddingArray[i];
    }
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  // Convert to tensors
  const aTensor = tf.tensor1d(a);
  const bTensor = tf.tensor1d(b);
  
  // Normalize vectors
  const aNorm = tf.norm(aTensor);
  const bNorm = tf.norm(bTensor);
  
  // Compute dot product
  const dotProduct = tf.sum(tf.mul(aTensor, bTensor));
  
  // Compute cosine similarity
  const similarity = tf.div(dotProduct, tf.mul(aNorm, bNorm));
  
  // Get the scalar value
  const result = similarity.dataSync()[0];
  
  // Clean up tensors to prevent memory leaks
  aTensor.dispose();
  bTensor.dispose();
  aNorm.dispose();
  bNorm.dispose();
  dotProduct.dispose();
  similarity.dispose();
  
  return result;
}

// Date extraction using compromise-dates
function extractDateFromText(text: string): string | null {
  try {
    const doc = nlp(text);
    // @ts-ignore - dates() method from compromise-dates plugin isn't recognized by TypeScript
    const dates = doc.dates().json();
    
    if (dates && dates.length > 0) {
      // Try to extract ISO date
      const startDate = dates[0].date;
      if (startDate) {
        return new Date(startDate).toISOString().split('T')[0];
      }
    }
    
    // Fallback to regex patterns for Spanish dates
    for (const pattern of DATE_PATTERNS) {
      const match = text.match(pattern.regex);
      if (match) {
        if (pattern.format) {
          return pattern.format(match);
        } else if (pattern.processMatch) {
          return pattern.processMatch(match);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting date:", error);
    return null;
  }
}

// Month mapping for Spanish date format
const MONTH_MAP: {[key: string]: string} = {
  'enero': '01',
  'febrero': '02',
  'marzo': '03',
  'abril': '04',
  'mayo': '05',
  'junio': '06',
  'julio': '07',
  'agosto': '08',
  'septiembre': '09',
  'octubre': '10',
  'noviembre': '11',
  'diciembre': '12'
};

// Date extraction patterns for regex fallback
const DATE_PATTERNS = [
  // dd/mm/yyyy or dd-mm-yyyy
  { regex: /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/, format: (d: RegExpMatchArray) => `${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}` },
  // Spanish format: day of month
  { regex: /(\d{1,2})\sde\s(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(\sde\s\d{4})?/i, processMatch: extractDateFromSpanishFormat }
];

// Function to extract date from Spanish format (e.g., "5 de mayo de 2023")
function extractDateFromSpanishFormat(match: RegExpMatchArray): string {
  const day = match[1].padStart(2, '0');
  const month = MONTH_MAP[match[2].toLowerCase()];
  const yearPart = match[3] ? match[3].replace(/\sde\s/, '') : new Date().getFullYear().toString();
  return `${yearPart}-${month}-${day}`;
}

// Function to detect intent using Universal Sentence Encoder
async function detectIntent(message: string): Promise<{ intentName: string; parameters: any }> {
  try {
    // Initialize model if not already done
    await initializeUseModel();
    
    if (useModel) {
      // Get embedding for the message
      const messageEmbedding = await useModel.embed([message]);
      const messageEmbeddingArray = await messageEmbedding.array();
      
      // Compare with intent embeddings
      let bestIntentName = 'UNKNOWN';
      let bestSimilarity = -1;
      
      for (const [intent, embedding] of Object.entries(intentEmbeddings)) {
        const similarity = cosineSimilarity(messageEmbeddingArray[0], embedding);
        
        if (similarity > bestSimilarity && similarity > 0.6) { // 0.6 is a threshold
          bestSimilarity = similarity;
          bestIntentName = intent;
        }
      }
      
      // Extract parameters based on intent
      const parameters = extractParameters(message, bestIntentName);
      
      return {
        intentName: bestIntentName,
        parameters
      };
    }
  } catch (error) {
    console.error("Error detecting intent with USE model:", error);
  }
  
  // Fallback to regex-based intent detection
  return fallbackIntentDetection(message);
}

// Fallback intent detection with regex patterns
function fallbackIntentDetection(message: string): { intentName: string; parameters: any } {
  const INTENT_PATTERNS = {
    CREATE_REMINDER: [
      /record[aá](me|r|rme|rnos)?\s/i,
      /crear\s(un\s)?recordatorio/i,
      /nueva\starea/i,
      /nuevo\sevento/i,
      /agregar\srecordatorio/i,
      /recordarme\s/i,
      /agendar/i,
      /programar\s/i
    ],
    LIST_REMINDERS: [
      /ver\s(mis\s)?recordatorios/i,
      /mostrar\s(mis\s)?recordatorios/i,
      /listar\s(mis\s)?recordatorios/i,
      /qu[eé]\srecordatorios\stengo/i,
      /mis\srecordatorios/i,
      /recordatorios\spendientes/i
    ],
    HELP: [
      /ayuda/i,
      /c[oó]mo\sfuncion[a-z]+/i,
      /qu[eé]\spuedes\shacer/i,
      /qu[eé]\seres/i,
      /para\squ[eé]\ssirves/i
    ],
    WEATHER: [
      /clima/i,
      /tiempo/i,
      /pronostico/i,
      /clima\sactual/i,
      /tiempo\sactual/i,
      /pronostico\sactual/i
    ],
    TIME_DATE: [
      /fecha/i,
      /hora/i,
      /fecha\sactual/i,
      /hora\sactual/i,
      /fecha\sactual/i,
      /hora\sactual/i
    ],
    ACTIVITIES_INFO: [
      /actividades/i,
      /actividad/i,
      /actividades\sdisponibles/i,
      /actividad\sdisponible/i,
      /actividades\sdisponibles/i,
      /actividad\sdisponible/i
    ],
    RESERVATIONS_HELP: [
      /reservaciones/i,
      /reservacion/i,
      /reservaciones\sdisponibles/i,
      /reservacion\sdisponible/i,
      /reservaciones\sdisponibles/i,
      /reservacion\sdisponible/i
    ],
    JOKES: [
      /joke/i,
      /jokes/i,
      /chiste/i,
      /chistes/i,
      /humor/i,
      /humores/i
    ]
  };

  // Try to match intent patterns
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return {
          intentName: intent,
          parameters: extractParameters(message, intent)
        };
      }
    }
  }

  // Default intent
  return {
    intentName: 'UNKNOWN',
    parameters: {}
  };
}

// Extract parameters based on intent
function extractParameters(message: string, intent: string): any {
  const params: any = {};

  if (intent === 'CREATE_REMINDER') {
    // Use compromise to extract the task
    const doc = nlp(message);
    
    // Try to extract title using NLP
    const verbs = doc.verbs().out('array');
    const nouns = doc.nouns().out('array');
    
    // Try to extract title
    if (nouns.length > 0) {
      // Find the longest noun phrase as potential task
      let longestNoun = '';
      for (const noun of nouns) {
        if (noun.length > longestNoun.length) {
          longestNoun = noun;
        }
      }
      params.title = longestNoun;
    }
    
    // Fallback to regex if NLP failed
    if (!params.title) {
      const titleMatch = message.match(/(?:recordar|recordarme|recordatorio|tarea|evento|programar)\s(?:que|para|sobre|de|el)?\s(.+?)(?:para\sel|en|el|a las|por la|antes del|después del|hasta el|\s\d{1,2}\sde|\s\d{1,2}\/|$)/i);
      if (titleMatch && titleMatch[1]) {
        params.title = titleMatch[1].trim();
      } else {
        // Fallback: use the message as title but remove intent keywords
        params.title = message.replace(/record[aá](me|r|rme|rnos)?|crear\s(un\s)?recordatorio|nueva\starea|nuevo\sevento|agregar\srecordatorio|programar(\sel)?/gi, '').trim();
      }
    }

    // Extract date using compromise-dates
    const dateString = extractDateFromText(message);
    if (dateString) {
      params.date = dateString;
    }

    // Try to extract priority
    if (/\b(urgente|importante|crítico|critico|alta\sprioridad)\b/i.test(message)) {
      params.priority = 3; // High
    } else if (/\b(media\sprioridad|normal)\b/i.test(message)) {
      params.priority = 2; // Medium
    } else {
      params.priority = 1; // Low (default)
    }
  }

  return params;
}

// Process user message and generate response
export async function processMessage(message: string): Promise<ChatResponse> {
  try {
    // Ensure the model is initialized
    await initializeUseModel();
    
    // Detect intent
    const { intentName, parameters } = await detectIntent(message);
    
    // Record the intent in the database
    const intentData = {
      name: intentName,
      description: `Intent detected from user message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      parameters
    };
    
    const { data: intentResult } = await createIntent(intentData);
    
    // Respuestas para cada intención
    const responses: {[key: string]: string[]} = {
      GREETING: [
        "¡Hola! ¿Cómo estás hoy? ¿En qué puedo ayudarte?",
        "¡Qué gusto saludarte! ¿Necesitas ayuda con algún recordatorio?",
        "¡Bienvenido! Soy Don Mariño, tu asistente personal. ¿En qué puedo servirte hoy?",
        "¡Hola! Estoy aquí para ayudarte con tus recordatorios y responder a tus preguntas."
      ],
      FAREWELL: [
        "¡Hasta pronto! No olvides revisar tus recordatorios pendientes.",
        "¡Adiós! Fue un placer ayudarte. Estaré aquí cuando me necesites.",
        "¡Que tengas un excelente día! Recuerda que puedes volver cuando quieras.",
        "¡Hasta la próxima! Estaré esperando para ayudarte con tus recordatorios."
      ],
      THANKS: [
        "¡De nada! Es un placer poder ayudarte.",
        "No hay de qué. Estoy aquí para lo que necesites.",
        "¡Encantado de ser útil! ¿Hay algo más en lo que pueda ayudarte?",
        "Para eso estoy. No dudes en pedirme ayuda cuando la necesites."
      ],
      WEATHER: [
        "Lo siento, no tengo acceso a información del clima en tiempo real. ¿Te gustaría que te ayude a crear un recordatorio para revisar el pronóstico?",
        "No puedo consultar el clima actual, pero puedo recordarte que revises el pronóstico si lo deseas.",
        "Aunque no puedo decirte el tiempo actual, puedo ayudarte a crear un recordatorio para que te lleves un paraguas si hay posibilidad de lluvia."
      ],
      SMALL_TALK: [
        "Soy Don Mariño, tu asistente virtual. Estoy aquí para ayudarte con tus recordatorios y conversar contigo sobre diversos temas.",
        "Me especializo en ayudarte a recordar cosas importantes, pero también disfruto de una buena conversación. ¿Quieres contarme algo?",
        "Soy un asistente virtual diseñado para hacer tu vida más fácil. Me encanta ayudar con recordatorios y charlar sobre diversos temas.",
        "Mi propósito es asistirte con tus recordatorios diarios y ofrecerte una experiencia conversacional agradable. ¿En qué más estás interesado?"
      ],
      JOKES: [
        "¿Qué hace una abeja en el gimnasio? ¡Zum-ba! 🐝",
        "¿Por qué los peces no usan redes sociales? ¡Porque temen caer en la red! 🐟",
        "¿Sabes por qué un libro de matemáticas se sentía triste? Porque tenía muchos problemas. 📚",
        "¿Qué le dice un pez a otro pez? Nada. 🐠"
      ],
      TIME_DATE: [
        "No tengo acceso a la fecha y hora actual, pero puedo ayudarte a crear un recordatorio para eventos importantes en tu calendario.",
        "Mi sistema no me permite consultar la hora actual, pero puedo recordarte eventos importantes según la fecha que me indiques.",
        "Aunque no puedo decirte qué día es hoy, puedo ayudarte a organizarte mejor con recordatorios para fechas importantes."
      ],
      ACTIVITIES_INFO: [
        "En nuestra plataforma puedes encontrar diversas actividades para reservar. Te recomiendo visitar la sección principal para ver todas las opciones disponibles.",
        "Tenemos actividades acuáticas, tours guiados, clases y muchas experiencias más. ¿Hay alguna categoría específica que te interese?",
        "Las actividades están organizadas por categorías en nuestra plataforma. ¿Te gustaría que te recuerde explorar alguna sección específica?"
      ],
      RESERVATIONS_HELP: [
        "Para hacer una reservación, debes seleccionar la actividad que te interesa y luego elegir la fecha y hora disponible. ¿Te gustaría que te cree un recordatorio para completar este proceso?",
        "El proceso de reserva es sencillo: elige la actividad, selecciona fecha y hora, completa tus datos y confirma. ¿Necesitas que te recuerde revisar las opciones disponibles?",
        "Puedes hacer reservaciones desde la página principal seleccionando la actividad deseada. ¿Te gustaría que te cree un recordatorio para explorar las actividades disponibles?"
      ],
      HELP: [
        "Soy Don Mariño, tu asistente conversacional. Puedo ayudarte con:\n- Crear recordatorios (ej. 'Recuérdame llamar al médico mañana')\n- Responder preguntas sobre las actividades disponibles\n- Asistirte con información sobre reservaciones\n- Conversar sobre temas diversos\n- Contarte chistes para alegrarte el día\n¿En qué puedo ayudarte hoy?",
        "Estoy aquí para asistirte principalmente con recordatorios y responder a tus preguntas. Puedo ayudarte a organizar tu agenda, informarte sobre actividades, guiarte en el proceso de reserva y mantener una conversación amena contigo."
      ]
    };
    
    // Handle different intents
    switch (intentName) {
      case 'CREATE_REMINDER':
        if (parameters.title && parameters.date) {
          // Crear el objeto recordatorio para la base de datos y localStorage
          const reminderData = {
            title: parameters.title,
            description: '',
            due_date: parameters.date,
            priority: parameters.priority || 1,
            status: 'pending' as 'pending',
            user_id: 'system', // Debería ser reemplazado por el ID del usuario actual
            created_at: new Date().toISOString()
          };
          
          try {
            let savedReminderId: string | undefined;
            
            // Intentar guardar el recordatorio en la base de datos
            try {
              const { data: reminderResult, error } = await createReminder(reminderData);
              if (!error && reminderResult) {
                savedReminderId = reminderResult.id;
              } else {
                console.warn('No se pudo guardar en la base de datos, usando solo localStorage');
              }
            } catch (dbError) {
              console.warn('Error al guardar en la base de datos, usando solo localStorage:', dbError);
            }
            
            // Guardar siempre en localStorage (como respaldo)
            const localReminderData: Omit<ReminderItem, 'id'> = {
              title: parameters.title,
              description: '',
              date: parameters.date,
              priority: parameters.priority || 1,
              status: 'pending',
              created_at: new Date().toISOString()
            };
            
            const localReminder = saveLocalReminder(localReminderData);
            
            return {
              text: `He creado un recordatorio sobre "${parameters.title}" para el ${new Date(parameters.date).toLocaleDateString('es-ES')}.`,
              reminder: {
                title: parameters.title,
                description: '',
                date: parameters.date,
                id: savedReminderId || localReminder.id
              }
            };
          } catch (err) {
            console.error('Error inesperado al crear recordatorio:', err);
            return {
              text: 'Lo siento, ha ocurrido un error inesperado al guardar tu recordatorio. Por favor, inténtalo de nuevo.'
            };
          }
        } else if (parameters.title) {
          return {
            text: 'He captado el tema del recordatorio, pero necesito saber cuándo debo recordártelo. ¿Para qué fecha es este recordatorio?'
          };
        } else if (parameters.date) {
          return {
            text: `He captado la fecha (${new Date(parameters.date).toLocaleDateString('es-ES')}), pero necesito saber qué debo recordarte. ¿Qué quieres que recuerde?`
          };
        } else {
          return {
            text: 'Entiendo que quieres crear un recordatorio. ¿Sobre qué tema y para cuándo lo necesitas?'
          };
        }
        
      case 'LIST_REMINDERS':
        return {
          text: 'Puedes ver tus recordatorios en la pestaña "Recordatorios". ¿Hay algo específico que estés buscando?'
        };
      
      case 'GREETING':
      case 'FAREWELL':
      case 'THANKS':
      case 'WEATHER':
      case 'SMALL_TALK':
      case 'JOKES':
      case 'TIME_DATE':
      case 'ACTIVITIES_INFO':
      case 'RESERVATIONS_HELP':
      case 'HELP':
        // Seleccionar una respuesta aleatoria de la categoría
        const categoryResponses = responses[intentName];
        const randomIndex = Math.floor(Math.random() * categoryResponses.length);
        return {
          text: categoryResponses[randomIndex]
        };
        
      default:
        // Respuestas por defecto cuando no se identifica la intención
        const defaultResponses = [
          "No he entendido completamente tu solicitud. ¿Puedes reformularla? Puedo ayudarte con recordatorios, información sobre actividades o responder preguntas generales.",
          "Disculpa, no estoy seguro de entender. ¿Te gustaría crear un recordatorio, saber sobre actividades disponibles o hablar de otro tema?",
          "Hmm, no logro captar lo que necesitas. Puedo ayudarte con recordatorios, darte información sobre actividades o simplemente charlar. ¿Qué prefieres?"
        ];
        
        return {
          text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
        };
    }
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      text: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.'
    };
  }
}
