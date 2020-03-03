import {Population} from './population';
import {NativeType} from './native-type';

export class Year {
  year: number;
  public population: Population[];
  // ToDO: Give it an Amount here to generate the Scales variable for the input Data
  constructor(year: number) {
    this.year = year;
    this.population = [];
  }
  getPopulation(nativeType: NativeType) {
    for (const x of this.population) {
      if (x.type === nativeType) {
        return x;
      }
    }
    return null;
  }
}
