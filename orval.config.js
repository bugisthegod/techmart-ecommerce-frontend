// orval.config.js
module.exports = {
  api: {
    input: 'http://localhost:8080/v3/api-docs',
    output: {
      target: './src/api/endpoints.ts',
      schemas: './src/api/models',
      client: 'axios',
      mode: 'tags-split'  // 按 Controller 分文件
    }
  }
}