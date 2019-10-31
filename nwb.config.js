module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false
  },
  webpack: {
    html: {
      title: 'Greenfield WebShell',
      mountId: 'root',
      template: 'public/index.html'
    }
  }
}
