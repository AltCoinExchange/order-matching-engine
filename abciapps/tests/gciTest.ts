// GCI: c23e772cc10cc9bc080d6a9c950970ebef2f5a2979acf1a2f75649726b49fe51
// New GCI: 8ef3e51c93a3472b00064afb14ea0446da462817b01b16a00c6c031ac97a0252
const { connect } = require('lotion');
const APPGCI = "8ef3e51c93a3472b00064afb14ea0446da462817b01b16a00c6c031ac97a0252";

async function getApp() {
  console.log('poceo');
  const { state, send } = await connect(APPGCI, { liteTimeout: 10000 });
  const count = await state;
  console.log(count);
  const result = await send({ nonce: 0 });
  console.log(result);
}

getApp();