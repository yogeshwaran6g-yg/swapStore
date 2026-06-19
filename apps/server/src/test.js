for (const rpc of process.env.POLYGON_RPC_URL.split(',')) {
  try {
    const client = createPublicClient({
      chain: polygon,
      transport: http(rpc.trim()),
    });

    const block = await client.getBlockNumber();
    console.log("WORKING:", rpc, block);
  } catch (e) {
    console.error("FAILED:", rpc, e.message);
  }
};
