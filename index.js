import app from './app.js'

// Start the application on port 3030
try {
  app.listen(3030, () => {
    console.log('SVO API is now listening on port 3030')
  })
} catch (e) {
  console.log(e)
}
