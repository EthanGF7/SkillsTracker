import { useState } from 'react'
import { CustomSkillResponse } from '../types/custom-skill'

interface CustomSkillFormProps {
  onSkillCreated: (skillName: string) => void
  onCancel: () => void
}

export default function CustomSkillForm({ onSkillCreated, onCancel }: CustomSkillFormProps) {
  const [skillName, setSkillName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!skillName.trim()) {
      setError('Por favor, introduce un nombre para la habilidad')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-skill-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skillName }),
      })

      if (!response.ok) {
        throw new Error('Error al generar la descripción')
      }

      const data: CustomSkillResponse = await response.json()
      
      // Aquí llamamos a la función que maneja la creación exitosa
      onSkillCreated(skillName)
    } catch (error) {
      setError('Error al crear la habilidad. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="skillName" className="block text-sm font-medium text-gray-700">
            Nombre de la Habilidad
          </label>
          <input
            type="text"
            id="skillName"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ej: Pensamiento crítico"
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Habilidad'}
          </button>
        </div>
      </form>
    </div>
  )
}
