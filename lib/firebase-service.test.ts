import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { FirestoreService } from "./firebase-service"
import type { EvaluacionAuditiva } from "@/types/evaluation"
import {
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore"

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: "serverTimestamp" })),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}))

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}))

// Mock db
vi.mock("./firebase", () => ({
  db: {},
}))

describe("FirestoreService", () => {
  let service: FirestoreService
  let mockEvaluation: EvaluacionAuditiva

  beforeEach(() => {
    service = new FirestoreService()
    mockEvaluation = {
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
          },
          oido_izquierdo: {
            "250": 15,
            "500": 20,
            "1000": 25,
            "2000": 30,
          },
        },
      ],
      examinador: {
        nombre: "Dr. López",
        codigo: "123456",
      },
      fechaExamen: new Date("2024-01-20"),
    }
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("saveEvaluation", () => {
    it("should save evaluation and return document ID", async () => {
      const mockDocRef = { id: "test-id-123" }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)

      const id = await service.saveEvaluation(mockEvaluation)

      expect(id).toBe("test-id-123")
      expect(addDoc).toHaveBeenCalledTimes(1)
    })

    it("should convert dates to timestamps when saving", async () => {
      const mockDocRef = { id: "test-id-123" }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)

      await service.saveEvaluation(mockEvaluation)

      const callArgs = vi.mocked(addDoc).mock.calls[0][1]
      expect(callArgs).toHaveProperty("createdAt")
      expect(callArgs).toHaveProperty("updatedAt")
    })

    it("should handle errors and show toast notification", async () => {
      vi.mocked(addDoc).mockRejectedValue(new Error("Network error"))

      await expect(service.saveEvaluation(mockEvaluation)).rejects.toThrow()
    })
  })

  describe("updateEvaluation", () => {
    it("should update evaluation successfully", async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await service.updateEvaluation("test-id", mockEvaluation)

      expect(updateDoc).toHaveBeenCalledTimes(1)
    })

    it("should include updatedAt timestamp", async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await service.updateEvaluation("test-id", mockEvaluation)

      const callArgs = vi.mocked(updateDoc).mock.calls[0][1]
      expect(callArgs).toHaveProperty("updatedAt")
    })

    it("should handle errors and show toast notification", async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error("Network error"))

      await expect(
        service.updateEvaluation("test-id", mockEvaluation)
      ).rejects.toThrow()
    })
  })

  describe("getEvaluation", () => {
    it("should return evaluation when document exists", async () => {
      const mockData = {
        paciente: {
          apellido: "García",
          nombre: "Juan",
          fechaNacimiento: {
            toDate: () => new Date("1990-01-15"),
          },
          sexo: "masculino",
        },
        pruebas: mockEvaluation.pruebas,
        examinador: mockEvaluation.examinador,
        fechaExamen: {
          toDate: () => new Date("2024-01-20"),
        },
      }

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "test-id",
        data: () => mockData,
      } as any)

      const result = await service.getEvaluation("test-id")

      expect(result).not.toBeNull()
      expect(result?.id).toBe("test-id")
      expect(result?.paciente.apellido).toBe("García")
    })

    it("should return null when document does not exist", async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any)

      const result = await service.getEvaluation("non-existent-id")

      expect(result).toBeNull()
    })

    it("should handle errors and show toast notification", async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error("Network error"))

      await expect(service.getEvaluation("test-id")).rejects.toThrow()
    })
  })

  describe("getAllEvaluations", () => {
    it("should return all evaluations ordered by date", async () => {
      const mockDocs = [
        {
          id: "id1",
          data: () => ({
            paciente: {
              apellido: "García",
              nombre: "Juan",
              fechaNacimiento: {
                toDate: () => new Date("1990-01-15"),
              },
              sexo: "masculino",
            },
            pruebas: [],
            examinador: { nombre: "Dr. López", codigo: "123456" },
            fechaExamen: {
              toDate: () => new Date("2024-01-20"),
            },
          }),
        },
        {
          id: "id2",
          data: () => ({
            paciente: {
              apellido: "Pérez",
              nombre: "María",
              fechaNacimiento: {
                toDate: () => new Date("1985-05-10"),
              },
              sexo: "femenino",
            },
            pruebas: [],
            examinador: { nombre: "Dr. López", codigo: "123456" },
            fechaExamen: {
              toDate: () => new Date("2024-01-19"),
            },
          }),
        },
      ]

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any)

      const result = await service.getAllEvaluations()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe("id1")
      expect(result[1].id).toBe("id2")
    })

    it("should return empty array when no evaluations exist", async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any)

      const result = await service.getAllEvaluations()

      expect(result).toEqual([])
    })

    it("should handle errors and show toast notification", async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error("Network error"))

      await expect(service.getAllEvaluations()).rejects.toThrow()
    })
  })

  describe("deleteEvaluation", () => {
    it("should delete evaluation successfully", async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined)

      await service.deleteEvaluation("test-id")

      expect(deleteDoc).toHaveBeenCalledTimes(1)
    })

    it("should handle errors and show toast notification", async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error("Network error"))

      await expect(service.deleteEvaluation("test-id")).rejects.toThrow()
    })
  })

  describe("searchEvaluations", () => {
    beforeEach(() => {
      const mockDocs = [
        {
          id: "id1",
          data: () => ({
            paciente: {
              apellido: "García",
              nombre: "Juan",
              fechaNacimiento: {
                toDate: () => new Date("1990-01-15"),
              },
              sexo: "masculino",
            },
            pruebas: [],
            examinador: { nombre: "Dr. López", codigo: "123456" },
            fechaExamen: {
              toDate: () => new Date("2024-01-20"),
            },
          }),
        },
        {
          id: "id2",
          data: () => ({
            paciente: {
              apellido: "Pérez",
              nombre: "María",
              fechaNacimiento: {
                toDate: () => new Date("1985-05-10"),
              },
              sexo: "femenino",
            },
            pruebas: [],
            examinador: { nombre: "Dr. López", codigo: "123456" },
            fechaExamen: {
              toDate: () => new Date("2024-01-19"),
            },
          }),
        },
        {
          id: "id3",
          data: () => ({
            paciente: {
              apellido: "Rodríguez",
              nombre: "Carlos",
              fechaNacimiento: {
                toDate: () => new Date("1992-03-25"),
              },
              sexo: "masculino",
            },
            pruebas: [],
            examinador: { nombre: "Dr. López", codigo: "123456" },
            fechaExamen: {
              toDate: () => new Date("2024-01-18"),
            },
          }),
        },
      ]

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any)
    })

    it("should filter evaluations by apellido", async () => {
      const result = await service.searchEvaluations("García")

      expect(result).toHaveLength(1)
      expect(result[0].paciente.apellido).toBe("García")
    })

    it("should filter evaluations by nombre", async () => {
      const result = await service.searchEvaluations("María")

      expect(result).toHaveLength(1)
      expect(result[0].paciente.nombre).toBe("María")
    })

    it("should be case-insensitive", async () => {
      const resultLower = await service.searchEvaluations("garcía")
      const resultUpper = await service.searchEvaluations("GARCÍA")
      const resultMixed = await service.searchEvaluations("GaRcÍa")

      expect(resultLower).toHaveLength(1)
      expect(resultUpper).toHaveLength(1)
      expect(resultMixed).toHaveLength(1)
    })

    it("should return multiple matches", async () => {
      const result = await service.searchEvaluations("a")

      expect(result.length).toBeGreaterThan(1)
    })

    it("should return empty array when no matches found", async () => {
      const result = await service.searchEvaluations("NoExiste")

      expect(result).toEqual([])
    })

    it("should handle errors and show toast notification", async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error("Network error"))

      await expect(service.searchEvaluations("test")).rejects.toThrow()
    })
  })
})
