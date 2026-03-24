require('dotenv').config()
const app = require('./src/app')
const UserModel = require('./src/models/user.model')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Crear tabla users si no existe
    await UserModel.createTable()
    console.log('✅ Tabla users verificada')

    app.listen(PORT, () => {
      console.log(`🚀 Servidor HAMISPORT corriendo en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message)
    process.exit(1)
  }
}

startServer()