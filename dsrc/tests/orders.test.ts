import {OrbitDbProvider} from '../../library/db/OrbitDbProvider';
import {Observable} from "rxjs/Observable";

async function bootstrap() {
  const db = new OrbitDbProvider("/orbitdb/QmR9XEZwkq5GD79HxUV7n6QC71MGEyUpqVMWEj9nufjnYp/altcoinio/ordermatching");
  db.Start().subscribe(async (e) => {
    // await db.Start();
    await db.put({ test: "test2", id: 55 });
    const obj = await db.find((o) => o.id === 66);
    console.log(obj);
  });
}

bootstrap();