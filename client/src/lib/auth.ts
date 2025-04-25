import { jwtDecode, type JwtPayload } from 'jwt-decode'

/**
 * Decodes a JWT token and returns the payload
 * @param token JWT token string
 * @returns Decoded token payload or null if decoding fails
 */
export const decodeToken = (token: string) => {
  try {
    const decoded = jwtDecode<JwtPayload & { 'chyve-dev/roles': string[] }>(token)
    if (!decoded) {
      console.error('Decoded token is null or undefined')
      return null
    }
    // Decode the payload part of the JWT token
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Extracts roles from a decoded token
 * @param decodedToken The decoded JWT token
 * @returns Array of roles or empty array if no roles found
 */
export const extractRoles = (
  decodedToken: JwtPayload & { 'chyve-dev/roles': string[] },
): string[] => {
  if (decodedToken && decodedToken['chyve-dev/roles']) {
    return decodedToken['chyve-dev/roles']
  }
  return []
}

/**
 * Checks if the decoded token contains the Admin role
 * @param decodedToken The decoded JWT token
 * @returns Boolean indicating if user has Admin role
 */
export const hasAdminRole = (decodedToken: any): boolean => {
  const roles = extractRoles(decodedToken)
  return roles.includes('Admin')
}
