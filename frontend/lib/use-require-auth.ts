import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useRequireAuth() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!localStorage.getItem('petopia_token')) {
      navigate('/login')
    }
  }, [navigate])
  return localStorage.getItem('petopia_token')
}
