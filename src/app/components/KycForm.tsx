import { useState } from 'react'

interface KycFormProps {
  onSubmit: () => void
}

export default function KycForm({ onSubmit }: KycFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    aadhaar: '',
    PanCard: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('KYC Data:', formData)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
        <input
          id="aadhaar"
          name="aadhaar"
          type="text"
          required
          value={formData.aadhaar}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="PanCard" className="block text-sm font-medium text-gray-700 mb-1">Pan Card Number</label>
        <input
          id="PanCard"
          name="PanCard"
          type="text"
          required
          value={formData.PanCard}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
      >
        Submit KYC
      </button>
    </form>
  )
}