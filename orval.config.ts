export default {
  auctionSystem: {
    input: 'http://localhost:8080/v3/api-docs',
    output: {
      target: './src/api/generated.tsx',
      client: 'react-query',
      clean: true,
    },
  },
};
