// Required imports
import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  // Subscribe to system events via storage
  api.query.system.events((events: any[]) => {
    // console.log(`\nReceived ${events.length} events:`);
    // 事件订阅
    events.forEach((record: { event: any; phase: any; }) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      if (api.events.balances.Transfer.is(event)) {
        console.log(`\n************* Event::${event.method} (转账事件): timestamp: ${Date.parse(new Date().toString())} *************\n`);
        event.data.forEach((data: { toString: () => any; }, index: string | number) => {
          console.log(`${types[index].type}: ${data.toString()}`);
        });
      } else if (api.events.system.ExtrinsicSuccess.is(event)) {
        let phase_json = JSON.parse(phase);
        if (phase_json.applyExtrinsic === 1) {
          console.log(`\n************* Event::${event.method} (区块确认时间): timestamp: ${Date.parse(new Date().toString())} *************`);
        }
      }

      // Show what we are busy with
      // console.log(`\n\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
      // console.log(`\n\t\t${event.meta}`);

      // Loop through each of the parameters, displaying the type and data
      // event.data.forEach((data: { toString: () => any; }, index: string | number) => {
      //   console.log(`\n\t\t\t${types[index].type}: ${data.toString()}`);
      // });
    });
  });
}


main().catch((e) => {
  console.error(e);
  process.exit(1);
});