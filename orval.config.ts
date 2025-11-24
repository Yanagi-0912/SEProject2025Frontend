export default {
  auctionSystem: {
    input: 'http://localhost:8080/v3/api-docs',
    output: {
      target: './src/api/generated.ts',
      client: 'react-query',
      clean: true,
    },
  },
};
