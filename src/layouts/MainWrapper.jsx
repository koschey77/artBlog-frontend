import {useEffect, useState} from 'react'
import {setUser} from '../utils/auth'
import {useAuthStore} from '../store/auth'
import {setUserData} from '../utils/analytics'

const MainWrapper = ({children}) => {
  // Initialize the 'loading' state variable and set its initial value to 'true'
  const [loading, setLoading] = useState(true)
  const {setLoading: setAuthLoading} = useAuthStore()

  // Define a useEffect hook to handle side effects after component mounting
  useEffect(() => {
    // Define an asynchronous function 'handler'
    const handler = async () => {
      try {
        // Set the 'loading' state to 'true' to indicate the component is loading
        setLoading(true)
        setAuthLoading(true)

        // Perform an asynchronous user authentication action
        await setUser()

        // Устанавливаем пользовательские данные в GA после аутентификации
        const userData = useAuthStore.getState().allUserData
        if (userData) {
          setUserData(userData)
        }
      } catch (error) {
        console.error('Error during authentication setup:', error)
      } finally {
        // Set the 'loading' state to 'false' to indicate the loading process has completed
        setLoading(false)
        setAuthLoading(false)
      }
    }
    // Call the 'handler' function immediately after the component is mounted
    handler()
  }, [setAuthLoading])

  // Render content conditionally based on the 'loading' state
  return <>{loading ? null : children}</>
}

export default MainWrapper
