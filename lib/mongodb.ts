import { MongoClient } from 'mongodb'

const options = {}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  // Validate at runtime, not at build time
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  if (clientPromise) {
    return clientPromise
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  return clientPromise
}

// Export the function, not the promise itself
// This ensures connection only happens when actually called
export default getClientPromise