import { initializeApp, getApps } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCj27VLkWFYnSZUWyUoRu-hlrme_0fsiKU",
  authDomain: "graficas2026.firebaseapp.com",
  projectId: "graficas2026",
  storageBucket: "graficas2026.firebasestorage.app",
  messagingSenderId: "975969503705",
  appId: "1:975969503705:web:df95b960382c00f8d131c8",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export interface ChartDocument {
  id?: string
  title: string
  patient?: string
  columnA: string
  columnB: string
  rows: { a: number; b: number }[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const COLLECTION_NAME = "charts"

export async function saveChart(chart: Omit<ChartDocument, "id" | "createdAt" | "updatedAt">) {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...chart,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateChart(id: string, chart: Omit<ChartDocument, "id" | "createdAt" | "updatedAt">) {
  const docRef = doc(db, COLLECTION_NAME, id)
  await updateDoc(docRef, {
    ...chart,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteChart(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

export async function getCharts(): Promise<ChartDocument[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChartDocument[]
}

export { db }
