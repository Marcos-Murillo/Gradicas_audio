import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import type { DocumentData } from "firebase/firestore"
import { db } from "./firebase"
import type { EvaluacionAuditiva } from "@/types/evaluation"
import { toast } from "@/hooks/use-toast"

/**
 * Interface for Firebase service operations
 */
export interface FirebaseService {
  saveEvaluation(evaluation: EvaluacionAuditiva): Promise<string>
  updateEvaluation(id: string, evaluation: EvaluacionAuditiva): Promise<void>
  getEvaluation(id: string): Promise<EvaluacionAuditiva | null>
  getAllEvaluations(): Promise<EvaluacionAuditiva[]>
  deleteEvaluation(id: string): Promise<void>
  searchEvaluations(query: string): Promise<EvaluacionAuditiva[]>
}

/**
 * Recursively removes all undefined values from an object.
 * Firestore does not accept undefined — only null or omitted fields.
 */
function removeUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => removeUndefined(v)) as unknown as T
  }
  if (obj !== null && typeof obj === "object" && !(obj instanceof Timestamp) && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    ) as unknown as T
  }
  return obj
}

/**
 * Firestore implementation of the Firebase service
 * Handles all CRUD operations for evaluaciones auditivas
 */
export class FirestoreService implements FirebaseService {
  private collection = "evaluaciones"

  /**
   * Converts Date objects to Firestore Timestamps for storage
   */
  private convertDatesToTimestamps(evaluation: EvaluacionAuditiva) {
    return {
      ...evaluation,
      paciente: {
        ...evaluation.paciente,
        fechaNacimiento: Timestamp.fromDate(evaluation.paciente.fechaNacimiento),
      },
      fechaExamen: Timestamp.fromDate(evaluation.fechaExamen),
    }
  }

  /**
   * Converts Firestore Timestamps back to Date objects
   */
  private convertTimestampsToDates(data: DocumentData): EvaluacionAuditiva {
    return {
      ...data,
      paciente: {
        ...data.paciente,
        fechaNacimiento: data.paciente.fechaNacimiento.toDate(),
      },
      fechaExamen: data.fechaExamen.toDate(),
    } as EvaluacionAuditiva
  }

  /**
   * Save a new evaluation to Firebase
   * @param evaluation - The evaluation to save
   * @returns The ID of the saved evaluation
   */
  async saveEvaluation(evaluation: EvaluacionAuditiva): Promise<string> {
    try {
      const data = removeUndefined({
        ...this.convertDatesToTimestamps(evaluation),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      const docRef = await addDoc(collection(db, this.collection), data)
      
      toast({
        title: "Éxito",
        description: "Evaluación guardada exitosamente",
      })
      
      return docRef.id
    } catch (error) {
      console.error("Error saving evaluation:", error)
      toast({
        title: "Error",
        description: "Error al guardar la evaluación. Por favor intente nuevamente.",
      })
      throw error
    }
  }

  /**
   * Update an existing evaluation in Firebase
   * @param id - The ID of the evaluation to update
   * @param evaluation - The updated evaluation data
   */
  async updateEvaluation(id: string, evaluation: EvaluacionAuditiva): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id)
      await updateDoc(docRef, removeUndefined({
        ...this.convertDatesToTimestamps(evaluation),
        updatedAt: serverTimestamp(),
      }))
      
      toast({
        title: "Éxito",
        description: "Evaluación actualizada exitosamente",
      })
    } catch (error) {
      console.error("Error updating evaluation:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la evaluación. Por favor intente nuevamente.",
      })
      throw error
    }
  }

  /**
   * Get a single evaluation by ID
   * @param id - The ID of the evaluation to retrieve
   * @returns The evaluation or null if not found
   */
  async getEvaluation(id: string): Promise<EvaluacionAuditiva | null> {
    try {
      const docRef = doc(db, this.collection, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...this.convertTimestampsToDates(data as DocumentData),
      }
    } catch (error) {
      console.error("Error getting evaluation:", error)
      toast({
        title: "Error",
        description: "Error al cargar la evaluación. Por favor intente nuevamente.",
      })
      throw error
    }
  }

  /**
   * Get all evaluations ordered by exam date (most recent first)
   * @returns Array of all evaluations
   */
  async getAllEvaluations(): Promise<EvaluacionAuditiva[]> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy("fechaExamen", "desc")
      )
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...this.convertTimestampsToDates(doc.data() as DocumentData),
      }))
    } catch (error) {
      console.error("Error loading evaluations:", error)
      toast({
        title: "Error",
        description: "Error al cargar las evaluaciones. Por favor recargue la página.",
      })
      throw error
    }
  }

  /**
   * Delete an evaluation from Firebase
   * @param id - The ID of the evaluation to delete
   */
  async deleteEvaluation(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id)
      await deleteDoc(docRef)
      
      toast({
        title: "Éxito",
        description: "Evaluación eliminada exitosamente",
      })
    } catch (error) {
      console.error("Error deleting evaluation:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la evaluación. Por favor intente nuevamente.",
      })
      throw error
    }
  }

  /**
   * Search evaluations by patient name or surname (case-insensitive)
   * @param query - The search query
   * @returns Array of matching evaluations
   */
  async searchEvaluations(query: string): Promise<EvaluacionAuditiva[]> {
    try {
      const allEvaluations = await this.getAllEvaluations()
      const lowerQuery = query.toLowerCase()

      return allEvaluations.filter(
        (evaluation) =>
          evaluation.paciente.apellido.toLowerCase().includes(lowerQuery) ||
          evaluation.paciente.nombre.toLowerCase().includes(lowerQuery)
      )
    } catch (error) {
      console.error("Error searching evaluations:", error)
      toast({
        title: "Error",
        description: "Error al buscar evaluaciones. Por favor intente nuevamente.",
      })
      throw error
    }
  }
}

/**
 * Singleton instance of the Firebase service
 */
export const firebaseService = new FirestoreService()
