

module.exports = exports = function lastModifiedPlugin (schema, options) {
  schema.add({ lastModified: Number })
  
  schema.pre('save', function (next) {
    this.lastModified = new Date().getTime()
    next()
  })
  
  if (options && options.index) {
    schema.path('lastModified').index(options.index)
  }
}