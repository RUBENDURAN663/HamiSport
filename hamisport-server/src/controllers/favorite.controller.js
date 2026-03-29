const FavoriteModel = require('../models/favorite.model')

const FavoriteController = {

  // POST /api/favorites/toggle/:exerciseId
  toggle: async (req, res) => {
    try {
      const userId     = req.user.id
      const exerciseId = parseInt(req.params.exerciseId)

      if (!exerciseId || isNaN(exerciseId)) {
        return res.status(400).json({ message: 'ID de ejercicio inválido' })
      }

      const already = await FavoriteModel.isFavorite(userId, exerciseId)

      if (already) {
        await FavoriteModel.remove(userId, exerciseId)
        return res.json({ favorited: false, message: 'Eliminado de favoritos' })
      } else {
        await FavoriteModel.add(userId, exerciseId)
        return res.json({ favorited: true, message: 'Agregado a favoritos' })
      }
    } catch (error) {
      console.error('Error toggle favorite:', error.message)
      res.status(500).json({ message: 'Error al actualizar favorito' })
    }
  },

  // GET /api/favorites
  getAll: async (req, res) => {
    try {
      const favorites = await FavoriteModel.getByUser(req.user.id)
      res.json({ favorites })
    } catch (error) {
      console.error('Error getAll favorites:', error.message)
      res.status(500).json({ message: 'Error al obtener favoritos' })
    }
  },

  // GET /api/favorites/ids
  getIds: async (req, res) => {
    try {
      const ids = await FavoriteModel.getIdsByUser(req.user.id)
      res.json({ ids })
    } catch (error) {
      console.error('Error getIds favorites:', error.message)
      res.status(500).json({ message: 'Error al obtener favoritos' })
    }
  }

}

module.exports = FavoriteController