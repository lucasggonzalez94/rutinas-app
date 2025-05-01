import requests
import json
from django.conf import settings

# URL base de la API de Node.js
API_BASE_URL = 'http://localhost:3000/api'

def obtener_datos_api(endpoint, metodo='GET', datos=None, token=None):
    """
    Realiza una petición a la API de Node.js y devuelve la respuesta.
    
    Args:
        endpoint (str): Endpoint de la API, sin la URL base.
        metodo (str): Método HTTP a utilizar (GET, POST, PUT, DELETE).
        datos (dict): Datos a enviar en la petición (para POST, PUT).
        token (str): Token de autenticación.
        
    Returns:
        dict: Respuesta de la API en formato JSON.
    """
    url = f"{API_BASE_URL}/{endpoint.lstrip('/')}"
    headers = {'Content-Type': 'application/json'}
    
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if metodo == 'GET':
            respuesta = requests.get(url, headers=headers)
        elif metodo == 'POST':
            respuesta = requests.post(url, data=json.dumps(datos), headers=headers)
        elif metodo == 'PUT':
            respuesta = requests.put(url, data=json.dumps(datos), headers=headers)
        elif metodo == 'DELETE':
            respuesta = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Método HTTP no soportado: {metodo}")
        
        # Verificar si la respuesta es exitosa
        respuesta.raise_for_status()
        
        # Intentar convertir la respuesta a JSON
        return respuesta.json()
    
    except requests.exceptions.RequestException as e:
        # Error de conexión o respuesta HTTP no exitosa
        print(f"Error al conectar con la API: {e}")
        return {'error': str(e)}
    except json.JSONDecodeError:
        # La respuesta no es un JSON válido
        print(f"Respuesta no válida de la API: {respuesta.text}")
        return {'error': 'Respuesta no válida de la API'}
    except Exception as e:
        # Otro tipo de error
        print(f"Error inesperado: {e}")
        return {'error': str(e)}
