// import { sendRequest } from '../client'

// // eslint-disable-next-line @typescript-eslint/no-empty-object-type
// export interface BoutAbstract {
//   // TODO: define this
// };

// let series: [string, BoutAbstract][] | null = null;

// export async function getSeries(): Promise<[string, BoutAbstract][]> {
//   if (series == null) {
//     const seriesObj = <object> await sendRequest('getSeries');
//     series = Array.from(new Map(Object.entries(seriesObj)));
//   }
//   return series;
// }
