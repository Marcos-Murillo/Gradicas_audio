/**
 * Example usage of the Firebase Service
 * 
 * This file demonstrates how to use the FirestoreService to manage
 * evaluaciones auditivas in the application.
 */

import { firebaseService } from "./firebase-service"
import type { EvaluacionAuditiva } from "@/types/evaluation"

/**
 * Example 1: Save a new evaluation
 */
export async function exampleSaveEvaluation() {
  const newEvaluation: EvaluacionAuditiva = {
    paciente: {
      apellido: "García",
      nombre: "Juan",
      fechaNacimiento: new Date("1990-01-15"),
      sexo: "masculino",
    },
    pruebas: [
      {
        tipo: "tonal",
        oido_derecho: {
          "250": 20,
          "500": 25,
          "1000": 30,
          "2000": 35,
          "4000": 40,
          "8000": 45,
        },
        oido_izquierdo: {
          "250": 15,
          "500": 20,
          "1000": 25,
          "2000": 30,
          "4000": 35,
          "8000": 40,
        },
      },
      {
        tipo: "logoaudiometria",
        srt: {
          derecho: 25,
          izquierdo: 20,
        },
        sds: {
          derecho: 95,
          izquierdo: 98,
        },
      },
    ],
    examinador: {
      nombre: "Dr. López",
      codigo: "123456",
    },
    fechaExamen: new Date(),
  }

  try {
    const id = await firebaseService.saveEvaluation(newEvaluation)
    console.log("Evaluation saved with ID:", id)
    return id
  } catch (error) {
    console.error("Failed to save evaluation:", error)
    throw error
  }
}

/**
 * Example 2: Get a single evaluation by ID
 */
export async function exampleGetEvaluation(id: string) {
  try {
    const evaluation = await firebaseService.getEvaluation(id)
    
    if (evaluation) {
      console.log("Found evaluation:", evaluation)
      console.log("Patient:", evaluation.paciente.nombre, evaluation.paciente.apellido)
      console.log("Exam date:", evaluation.fechaExamen)
      console.log("Number of tests:", evaluation.pruebas.length)
    } else {
      console.log("Evaluation not found")
    }
    
    return evaluation
  } catch (error) {
    console.error("Failed to get evaluation:", error)
    throw error
  }
}

/**
 * Example 3: Get all evaluations
 */
export async function exampleGetAllEvaluations() {
  try {
    const evaluations = await firebaseService.getAllEvaluations()
    console.log(`Found ${evaluations.length} evaluations`)
    
    // Display summary of each evaluation
    evaluations.forEach((evaluation, index) => {
      console.log(`${index + 1}. ${evaluation.paciente.apellido}, ${evaluation.paciente.nombre}`)
      console.log(`   Exam date: ${evaluation.fechaExamen.toLocaleDateString()}`)
      console.log(`   Tests: ${evaluation.pruebas.map(p => p.tipo).join(", ")}`)
    })
    
    return evaluations
  } catch (error) {
    console.error("Failed to get evaluations:", error)
    throw error
  }
}

/**
 * Example 4: Update an existing evaluation
 */
export async function exampleUpdateEvaluation(id: string) {
  try {
    // First, get the existing evaluation
    const evaluation = await firebaseService.getEvaluation(id)
    
    if (!evaluation) {
      console.log("Evaluation not found")
      return
    }
    
    // Modify the evaluation
    evaluation.examinador.nombre = "Dr. Rodríguez"
    evaluation.paciente.apellido = "García Pérez"
    
    // Update in Firebase
    await firebaseService.updateEvaluation(id, evaluation)
    console.log("Evaluation updated successfully")
  } catch (error) {
    console.error("Failed to update evaluation:", error)
    throw error
  }
}

/**
 * Example 5: Search evaluations by patient name
 */
export async function exampleSearchEvaluations(query: string) {
  try {
    const results = await firebaseService.searchEvaluations(query)
    console.log(`Found ${results.length} evaluations matching "${query}"`)
    
    results.forEach((evaluation) => {
      console.log(`- ${evaluation.paciente.apellido}, ${evaluation.paciente.nombre}`)
    })
    
    return results
  } catch (error) {
    console.error("Failed to search evaluations:", error)
    throw error
  }
}

/**
 * Example 6: Delete an evaluation
 */
export async function exampleDeleteEvaluation(id: string) {
  try {
    // Confirm before deleting (in a real app, this would be a UI confirmation)
    const confirmed = true // In real app: await showConfirmDialog()
    
    if (confirmed) {
      await firebaseService.deleteEvaluation(id)
      console.log("Evaluation deleted successfully")
    }
  } catch (error) {
    console.error("Failed to delete evaluation:", error)
    throw error
  }
}

/**
 * Example 7: Complete workflow - Create, Read, Update, Delete
 */
export async function exampleCompleteWorkflow() {
  try {
    // 1. Create a new evaluation
    console.log("Step 1: Creating evaluation...")
    const id = await exampleSaveEvaluation()
    
    // 2. Read the evaluation
    console.log("\nStep 2: Reading evaluation...")
    await exampleGetEvaluation(id)
    
    // 3. Update the evaluation
    console.log("\nStep 3: Updating evaluation...")
    await exampleUpdateEvaluation(id)
    
    // 4. Search for the evaluation
    console.log("\nStep 4: Searching evaluations...")
    await exampleSearchEvaluations("García")
    
    // 5. Delete the evaluation
    console.log("\nStep 5: Deleting evaluation...")
    await exampleDeleteEvaluation(id)
    
    console.log("\nWorkflow completed successfully!")
  } catch (error) {
    console.error("Workflow failed:", error)
    throw error
  }
}

/**
 * Example 8: Using the service in a React component
 */
export const exampleReactUsage = `
import { useState, useEffect } from 'react'
import { firebaseService } from '@/lib/firebase-service'
import type { EvaluacionAuditiva } from '@/types/evaluation'

export function EvaluationsList() {
  const [evaluations, setEvaluations] = useState<EvaluacionAuditiva[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load all evaluations on mount
  useEffect(() => {
    loadEvaluations()
  }, [])

  async function loadEvaluations() {
    try {
      setLoading(true)
      const data = await firebaseService.getAllEvaluations()
      setEvaluations(data)
    } catch (error) {
      console.error('Failed to load evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search evaluations
  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (query.trim() === '') {
      loadEvaluations()
    } else {
      try {
        const results = await firebaseService.searchEvaluations(query)
        setEvaluations(results)
      } catch (error) {
        console.error('Search failed:', error)
      }
    }
  }

  // Delete evaluation
  async function handleDelete(id: string) {
    if (confirm('¿Está seguro de eliminar esta evaluación?')) {
      try {
        await firebaseService.deleteEvaluation(id)
        loadEvaluations() // Reload list
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por nombre o apellido..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      <ul>
        {evaluations.map((evaluation) => (
          <li key={evaluation.id}>
            <span>
              {evaluation.paciente.apellido}, {evaluation.paciente.nombre}
            </span>
            <button onClick={() => handleDelete(evaluation.id!)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
`
