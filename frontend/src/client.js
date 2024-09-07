const socket = new WebSocket('ws://' + window.location.host + '/ws');
const ackResolutions = new Map()
var lastSent = null;

export async function send(action, args = undefined) {
  lastSent = new Date();

  const ackId = crypto.randomUUID();
  const request = { action, args, clientTimestamp: lastSent, ackId };
  socket.send(JSON.stringify(request));

  return new Promise((resolve) => ackResolutions.set(ackId, resolve))
    .then((value) => {
      return value;
      // console.log('Got ACK: ' + JSON.stringify(value));
    });
}

socket.onopen = async (event) => {
  console.log('WebSocket connection established.');

  let ret = await send('logMessage', { message: 'This is my message!' });
  console.log('Got AcK: ' + ret)
};

socket.onmessage = (event) => {
  const response = JSON.parse(event.data)

  // Check if this message is an ACK to a previous message
  const resolveMessage = ackResolutions.get(response.ackId);
  if (resolveMessage) {
    ackResolutions.delete(response.ackId);
    resolveMessage(response.data);

    if (response.updateLatency) {
      send('updateLatency')
    }

    return;
  }

  // Handle non-ACK message
  // TODO

};

socket.onclose = (event) => {
  console.log('WebSocket connection closed:', event.reason);
  ackResolutions.clear();
};
