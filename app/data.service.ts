import {Injectable} from '@angular/core';
import {Population} from './class/population';
import {NativeType} from './class/native-type';
import {Gender} from './class/gender';
import {Year} from './class/year';
import {isNullOrUndefined, isUndefined} from 'util';

export interface PieItem {
  name: string;
  value: number;
  abs: number;
}
export enum Type {
  FERTILITY,
  IMMIGRATION,
  MORTALITY,
  GENDER_DISTRIBUTION,
  SUBSEQUENT_IMMIGRATION

}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // todo Standard Werte
  private probability_male = 0.5;
  private amount_nativenonmuslim = 8 * 10000000;
  private amount_nativemuslim = 2 * 10000000;
  private amount_nonmuslim = 5 * 100000;
  private amount_nmuslim = 5 * 1000000;
  private reunificationYears = 3;

  constructor() {
    console.log('Data Service Hook');
    this.generateEmptyYears();

    this.fillArraysEmpty();
    this.fillStartPopulation();
    this.fillRandomYearwithDummyData();
    this.calculatePopulation(2021);
   // this.calculatePopulation();
  }
  private startYear = 2020;
  private endYear = 2100;
  /*
  Privates
   */

  years: Year[];
  /*
  Statics
   */
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  static getColors() {
    return ['#b32020', '#f2b448', '#e0aaa1', '#e22011'];

    // visibility [ '#E0EEA1', '#B222a0', '#FFBBFF' ];
  }
  fillStartPopulation(year= 2020) {


    const nativemuslim = new Population(2020, NativeType.EinheimischeMuslime);
    const nativenonmuslim = new Population(2020, NativeType.EinheimischeNichtMuslime);
    const muslim = new Population(2020, NativeType.MuslimischeEinwanderer);
    const nonmuslim = new Population(2020, NativeType.NichtMuslimischeEinwanderer);
    for (let i = 0; i <= 100; i++) {
      // (age: number, surviverate: number, migrationrate: number, birthrate: number, amount: number, male: boolean, immigration = 0,
      //               reunification = 0) {
      const surviverate =  (i == 100 ? 0 : 1 - i / 1000); // 1 - i/100;

      let birthrate = 0;
      if (i <= 35 && i >= 18) {
        birthrate = 0.15;
      }
      const amountMale = (this.amount_nativenonmuslim / 2) / 101;
      const amountFemale = (this.amount_nativenonmuslim / 2) / 101;
      const male = new Gender(i, surviverate, 0, 0, amountMale, true, 0, 0, (i % 10 != 0));
      const female = new Gender(i, surviverate, 0, birthrate, amountMale, true, 0, 0, (i % 10 != 0));
      nativenonmuslim.pushMale(male);
      nativenonmuslim.pushFemale(female);
      nativenonmuslim.amount += amountFemale + amountMale;
      ///// zusätzliches
      const nmMale = new Gender(i, surviverate, 0, 0, this.amount_nativemuslim / 202, true, 0, 0, (i % 10 == 0 ? false : true));
      const nmFemale = new Gender(i, surviverate, 0, birthrate * 2, this.amount_nativemuslim / 202, false, 0, 0, (i % 10 == 0 ? false : true));
      const nnmMale = new Gender(i, surviverate, 0, 0, this.amount_nmuslim / 202, true, 0, 0, (i % 10 == 0 ? false : true));
      const nnmFemale = new Gender(i, surviverate, 0, birthrate * 3, this.amount_nmuslim / 202, false, 0, 0, (i % 10 == 0 ? false : true));
      const nMale = new Gender(i, surviverate, 0, 0, this.amount_nonmuslim / 202, true, 0, 0, (i % 10 == 0 ? false : true));
      const nFemale = new Gender(i, surviverate, 0, birthrate, this.amount_nonmuslim / 202, false, 0, 0, (i % 10 == 0 ? false : true));
      if (i == 0 || i >= 99) {
        male.surviverate_generated = false;
        female.surviverate_generated = false;
        nmMale.surviverate_generated = false;
        nmFemale.surviverate_generated = false;
        nnmMale.surviverate_generated = false;
        nnmFemale.surviverate_generated = false;
        nMale.surviverate_generated = false;
        nFemale.surviverate_generated = false;
      }
      if (i == 17 || i == 18 || i == 35 || i == 36) {
        female.birthrate_generated = false;
        nmFemale.birthrate_generated = false;
        nnmFemale.birthrate_generated = false;
        nFemale.birthrate_generated = false;
      }
      muslim.pushFemale(nnmFemale);
      muslim.pushMale(nnmMale);
      nativemuslim.pushFemale(nmFemale);
      nativemuslim.pushMale(nmMale);
      muslim.amount += nnmFemale.amount + nnmMale.amount;
      nativemuslim.amount += nmFemale.amount + nmMale.amount;
      nonmuslim.pushMale(nMale);
      nonmuslim.pushFemale(nFemale);
      nonmuslim.amount += nFemale.amount + nMale.amount;


      this.years[0].population = [];
      this.years[0].population.push(nativemuslim);
      this.years[0].population.push(nativenonmuslim);

      this.years[0].population.push(muslim);
      this.years[0].population.push(nonmuslim);

    }
  }
  fillRandomYearwithDummyData() {
    const year = this.startYear + DataService.getRandomInt(80);
   // const year = this.startYear + 50;
    const nativemuslim = new Population(year, NativeType.EinheimischeMuslime);
    const nativenonmuslim = new Population(year, NativeType.EinheimischeNichtMuslime);
    const muslim = new Population(year, NativeType.MuslimischeEinwanderer);
    const nonmuslim = new Population(year, NativeType.NichtMuslimischeEinwanderer);
    for (let i = 0; i <= 100; i++) {
      // (age: number, surviverate: number, migrationrate: number, birthrate: number, amount: number, male: boolean, immigration = 0,
      //               reunification = 0) {
      const surviverate = (i == 100 ? 0 : 1 - i / 1000); // 1 - i/100;

      let birthrate = 0;
      if (i <= 35 && i >= 18) {
        birthrate = 0.15;
      }
      const amountMale = 300000;
      const amountFemale = 300000;
      const male = new Gender(i, surviverate, 0, 0, amountMale, true, 0, 0, (i % 10 != 0));
      const female = new Gender(i, surviverate, 0, birthrate, amountMale, true, 0, 0, (i % 10 != 0));
      nativenonmuslim.pushMale(male);
      nativenonmuslim.pushFemale(female);
      nativenonmuslim.amount += amountFemale + amountMale;
      ///// zusätzliches
      const nmMale = new Gender(i, surviverate, 0, 0, 300000, true, 0, 0, (i % 10 == 0 ? false : true));
      const nmFemale = new Gender(i, surviverate, 0, birthrate * 2, 300000, false, 0, 0, (i % 10 == 0 ? false : true));
      const nnmMale = new Gender(i, surviverate, 0, 0, 300000, true, 0, 0, (i % 10 == 0 ? false : true));
      const nnmFemale = new Gender(i, surviverate, 0, birthrate * 3, 300000, false, 0, 0, (i % 10 == 0 ? false : true));
      const nMale = new Gender(i, surviverate, 0, 0, 300000, true, 0, 0, (i % 10 == 0 ? false : true));
      const nFemale = new Gender(i, surviverate, 0, birthrate, 300000, false, 0, 0, (i % 10 == 0 ? false : true));
      if (i == 0 || i >= 99) {
        male.surviverate_generated = false;
        female.surviverate_generated = false;
        nmMale.surviverate_generated = false;
        nmFemale.surviverate_generated = false;
        nnmMale.surviverate_generated = false;
        nnmFemale.surviverate_generated = false;
        nMale.surviverate_generated = false;
        nFemale.surviverate_generated = false;
      }
      male.setallFlags(false);
      female.setallFlags(false);
      nMale.setallFlags(false);
      nmMale.setallFlags(false);
      nnmMale.setallFlags(false);
      nFemale.setallFlags(false);
      nmFemale.setallFlags(false);
      nnmFemale.setallFlags(false);

      muslim.pushFemale(nnmFemale);
      muslim.pushMale(nnmMale);
      nativemuslim.pushFemale(nmFemale);
      nativemuslim.pushMale(nmMale);
      muslim.amount += nnmFemale.amount + nnmMale.amount;
      nativemuslim.amount += nmFemale.amount + nmMale.amount;
      nonmuslim.pushMale(nMale);
      nonmuslim.pushFemale(nFemale);
      nonmuslim.amount += nFemale.amount + nMale.amount;

      muslim.birth_amount = 2.8;
      nativemuslim.birth_amount = 2.4;
      nonmuslim.birth_amount = 1.8;
      nativenonmuslim.birth_amount = 1.4;

      this.years[year - this.startYear].population = [];
      this.years[year - this.startYear].population.push(nativemuslim);
      this.years[year - this.startYear].population.push(nativenonmuslim);

      this.years[year - this.startYear].population.push(muslim);
      this.years[year - this.startYear].population.push(nonmuslim);

    }}

    fillArraysEmpty() {

    let nativemuslim: Population;
    let nativenonmuslim: Population;
    let muslim: Population;
    let nonmuslim: Population;
    for (let y = this.startYear ; y <= this.endYear; y ++  ) {
        /*nativemuslim = new Population(y, new NativeType('Einheimische Muslime', true));
        nativenonmuslim = new Population(y, new NativeType('Einheimische Nicht Muslime', true));
        muslim = new Population(y, new NativeType('Muslimische Einwanderer'));
        muslim = new Population(y, new NativeType('Muslimische Einwanderer'));
        nonmuslim = new Population(y, new NativeType('Nicht Muslimische Einwanderer'));*/
      nativemuslim = new Population(y, NativeType.EinheimischeMuslime);
      nativenonmuslim = new Population(y, NativeType.EinheimischeNichtMuslime);
      muslim = new Population(y, NativeType.MuslimischeEinwanderer);
      nonmuslim = new Population(y, NativeType.NichtMuslimischeEinwanderer);
     // console.log(muslim);
      for (let i = 0; i <= 100; i++) {
        // (age: number, surviverate: number, migrationrate: number, birthrate: number, amount: number, male: boolean, immigration = 0,
        //               reunification = 0) {
        const male = new Gender(i, 0, 0, 0,
          -1,  true, 0, 0 );
        const female = new Gender(i, 0, 0,  0 ,
          -1, false, 0, 0);
        nativenonmuslim.pushMale(male);
        nativenonmuslim.pushFemale(female);


        ///// zusätzliches
        muslim.pushFemale(new Gender(i, 0, 0, 0,  -1, true, 0, .01));
        muslim.pushMale(new Gender(i, 0, 0, 0,  -1, true, 0, .01));
        nativemuslim.pushFemale(new Gender(i, 0, 0, 0,  -1, true, 0, .01));
        nativemuslim.pushMale(new Gender(i, 0, 0, 0,  -1, true, 0, .01));
        nonmuslim.pushMale(new Gender(i, 0, 0, 0,  -1, true, 0, .01));
        nonmuslim.pushFemale(new Gender(i, 0, 0, 0,  -1, true, 0, .01));
       }
      this.years[y - this.startYear].population = [];
      this.years[y - this.startYear].population.push(nativemuslim);
      this.years[y - this.startYear].population.push(nativenonmuslim);

      this.years[y - this.startYear].population.push(muslim);
      this.years[y - this.startYear].population.push(nonmuslim);

      }


  }


    saveGraphInput(values: number[], nativeType: NativeType, year: number ) { // ValueType
    // ToDO : Rausfinden ob die population schon vorhanden ist und dann die Values in den jeweiligen Alters Verteilung speichern oder erstellen
  }


  // Berechnungen //

    calculatePopulation(year: number = 2021) {
      // Generate Population ; Startwerten und alles andere ist leer
     // Über Jahre Laufen : uznd Population anfangen
      // TODO : Fehlerquelle mit unterlaufen
      const yearstoslice = year - this.startYear;
      let beforeYear = this.years[yearstoslice - 1];

      for (const yearObj of this.years.slice(yearstoslice)) {
        let reunificationYear = null;
        if ( this.endYear - yearObj.year >=  this.reunificationYears) {
          // reunificationYear
          reunificationYear = this.years[(yearObj.year + this.reunificationYears) - this.startYear];
        }

        this.nextYear(yearObj, beforeYear, reunificationYear);

        beforeYear = yearObj;

     //   console.log(yearObj, beforeYear, reunificationYear);
      }

    }

    nextYear(year, beforeYear, reunificationYear) {

    /*
    Für jede Population berechne AMount aus Vorjahr , dann Werte einzeln holen aus den Jahren vorher ,
    ausser ist gesetzt in Pop , dann hol es da her
     */
    for (let popIterator = 0 ; popIterator < beforeYear.population.length; popIterator ++) {
    /*
      Überleben berechnen
      Newborns
      Wenn Immigration dann immigration
      wenn nachzug, dann nahzug
     */

    // Nur ienen iterator da  Frau und mann symmetrisch in der länge
      let newbornsFemale = 0;
      let newbornsMale = 0;
      for (let ageIterator = 1 ; ageIterator < beforeYear.population[popIterator].male.length ; ageIterator ++) {
        const beforeYearPopMale = beforeYear.population[popIterator].male[ageIterator - 1];
        const beforeYearPopFemale = beforeYear.population[popIterator].female[ageIterator - 1];

        // Grundmenge
        let amountMale =  beforeYearPopMale.amount * beforeYearPopMale.surviverate;
        let amountFemale = beforeYearPopFemale.amount * beforeYearPopFemale.surviverate;
        /*//EmMigration abziehen
        let migrationM = beforeYearPopMale.amount * beforeYearPopMale.migration;

        amountMale -= migrationM;
        */
        // nachzug drauf rechnen
        // TODO : FRAGE an Klaus und Behnud wie sie es gerne hätten, prozentual der aktuellen bevölkerung oder  X jahre später??
        // Wo speichern wir das ???



        // migration drauf rechnen

        //   const immigrationM = beforeYear.population[popIterator].immigration * beforeYearPopMale.immigration;
        // const immigrationF = beforeYear.population[popIterator].immigration * beforeYearPopFemale.immigration;
        amountMale += beforeYearPopMale.immigration;
        amountFemale += beforeYearPopFemale.immigration;
        const birth = beforeYear.population[popIterator].birth_amount * beforeYearPopFemale.amount * beforeYearPopFemale.birthrate;
        newbornsFemale +=   birth * (1 - this.probability_male);
        newbornsMale += birth * (this.probability_male);
         /*
        // emigration abziehen
        amountMale -= beforeYearPopMale.amount * beforeYearPopMale.migration;
        amountFemale -= beforeYearPopFemale.amount * beforeYearPopFemale.migration;
        */

        /*
          HOle die Daten die schon da sind . Sonst im nächsten Jahr eintragen (+1 alle rates)
        */

        this.setGenderArray(year.population[popIterator].female[ageIterator],
                            beforeYear.population[popIterator].female[ageIterator], year.population[popIterator], amountFemale);
        this.setGenderArray(year.population[popIterator].male[ageIterator],
                            beforeYear.population[popIterator].male[ageIterator], year.population[popIterator], amountMale);

        if (!isNullOrUndefined(reunificationYear)) { // wenn es gesetzt ist
          reunificationYear.population[popIterator].female[ageIterator].amount_reunification =
            amountFemale * year.population[popIterator].female[ageIterator].reunification;
          reunificationYear.population[popIterator].male[ageIterator].amount_reunification =
            amountMale * year.population[popIterator].male[ageIterator].reunification;
          }
      }
      this.setGenderArray(year.population[popIterator].male[0], beforeYear.population[popIterator].male[0], year.population[popIterator], newbornsMale);
      this.setGenderArray(year.population[popIterator].female[0], beforeYear.population[popIterator].female[0], year.population[popIterator], newbornsFemale);
      if (!isNullOrUndefined(reunificationYear)) { // wenn es gesetzt ist
        reunificationYear.population[popIterator].female[0].amount_reunification =
          newbornsFemale * year.population[popIterator].female[0].reunification;
        reunificationYear.population[popIterator].male[0].amount_reunification =
          newbornsMale * year.population[popIterator].male[0].reunification;
      }
      // Immigration zusammenrechnen auf Populationsebene
      year.population[popIterator].immigration = year.population[popIterator].immigration_male + year.population[popIterator].immigration_female;
      //birthamount übernehmen wenn flag
      // TODO: Flag ???
      year.population[popIterator].birth_amount = beforeYear.population[popIterator].birth_amount;
 //     console.log(this.years);
    }
  }
  private setGenderArray(genderYear: Gender, genderBeforeYear: Gender, referencepopulation: Population, newAmount: number ) {

        if (genderYear.amount_flag) {
          genderYear.amount = newAmount + genderYear.amount_reunification;
          if (referencepopulation.amount <= 0 || genderYear.age == 1) { /// im ersten jAhr
            referencepopulation.amount = genderYear.amount;
          } else {
            referencepopulation.amount += genderYear.amount;
          }
        }

        if (genderYear.surviverate_flag) {
        genderYear.surviverate = genderBeforeYear.surviverate;
        genderYear.surviverate_generated = genderBeforeYear.surviverate_generated;
      }
        if (genderYear.emigration_flag) {
        genderYear.emigrationsrate = genderBeforeYear.emigrationsrate;
        genderYear.emigrationsrate_generated = genderBeforeYear.emigrationsrate_generated;
      }
        if (genderYear.birthrate_flag) {
        genderYear.birthrate = genderBeforeYear.birthrate;
        genderYear.birthrate_generated = genderBeforeYear.birthrate_generated;

      }
        if (genderYear.immigration_flag) {
          console.log('hier stop immigration');
          // ToDO : POopuilationsarray , nochmal die immigration überprüfen (siehe amount flag)
          genderYear.immigration = genderBeforeYear.immigration;
          genderYear.immigration_generated = genderBeforeYear.immigration_generated;
          if ( genderYear.male) { // male
            if (referencepopulation.immigration_male <= 0 || genderYear.age == 1) {
              referencepopulation.immigration_male = genderYear.immigration;
            } else {
              referencepopulation.immigration_male += genderYear.immigration;
            }
        } else { // female
          if (referencepopulation.immigration_female <= 0 || genderYear.age == 1) {
            referencepopulation.immigration_female = genderYear.immigration;
          } else {
            referencepopulation.immigration_female += genderYear.immigration;
          }
        }

      }
        if (genderYear.reunification_flag) {
        genderYear.reunification = genderBeforeYear.reunification;
        genderYear.reunification_generated = genderBeforeYear.reunification_generated;
      }
  }

  private generateEmptyYears() {
    this.years = [];
    for ( let i = this.startYear ; i <= this.endYear ; i ++) {
      this.years.push( new Year(i));
    }
  }
  getPopulationForStackbar(startyear = 2020) {
    const copy = [];

    for (let j = startyear ; j < startyear + this.years.length ; j++ ) {
      const test = {year : j};
      for (const key of this.getKeys()) {
        test[key.toString()] = 0;
      }
      copy.push(test);
    }
    for ( const year of this.years) {
      if (year.population.length > 0) {
        for (const population of year.population) {
          copy[year.year - startyear][population.type] = population.amount;

        }
      } else {
        for (const key of this.getKeys()) {
          copy[year.year - startyear][key] = 0;
        }
      }
    }

    console.log(copy);
    /*
    // console.log(copy);
    this.population.forEach( function (element) {
      // element = element;
      copy[element.year - startyear][element.type.appearance.toString()] = element.amount;
    });
*/
    return copy;
  }
  getPopulationForPyramid(year = this.startYear) {
    // todo : Anfassen damit es mit Enum geht
    const copy = [];
    const copyfemale = [];
    const pushing = function(age: number, male: boolean, keys ) {
      return Object.assign({}, {male, age}, keys);
      // {male: male, age: age , 'Native Non Muslim': 0 , 'Native Muslim': 0, 'Non Native Non Muslim': 0, 'Non Native Muslim': 0};
    };
    const keys = this.getKeys().reduce((a, b) => (a[b] = 0, a) , {});
    console.log(keys, );
    for (let i = 0 ; i <= 100 ; i++) {
      copy.push(pushing(i, true, keys));
      copyfemale.push(pushing(i, false, keys));
    }
    this.years[year - this.startYear].population.forEach(
      function(element) {

          const typeApp = element.type;
          // console.log(element);
          element.male.forEach( function(maleElem) {
              /*  const i = copy.findIndex(
                  d => d.age === maleElem.age && d.male === true
                );*/
              console.log('y not?');
              copy[maleElem.age][typeApp] = isNullOrUndefined(maleElem.amount) ? 0 : maleElem.amount;
            }
          );
          element.female.forEach( function(femaleElem) {

              copyfemale[femaleElem.age][typeApp] = isNullOrUndefined(femaleElem.amount) ? 0 : femaleElem.amount;
            }
          );


      });

    return [copy, copyfemale];
  }
  getKeys() {
    // TODO : Make this variable by input
    return ['Einheimische Nicht Muslime', 'Einheimische Muslime', 'Muslimische Einwanderer',
      'Nicht Muslimische Einwanderer'];
    // ['Deutsch', 'Muslimische Einwanderer', 'Nicht Muslimische Einwanderer'];
  }
  /*
    getDataForPie(): number[] {
    return [this.pieData[this.pieData.length - 2].amount,
      this.pieData[this.pieData.length - 1].amount];
  }

      const amountA = this.population[this.population.length - 2].amount;
    const amountB = this.population[this.population.length - 1].amount;
    const total = amountA + amountB;
    this.pieData.push( {amount: amountA, type: 'A' , percentage: amountA / total, year: this.act_year, total: total});
    this.pieData.push( {amount: amountB, type: 'B' , percentage: amountB / total, year: this.act_year, total: total});
   */
  /*
  getDataForPie(year = this.startYear) {
    const pieData = Object.assign({},this.getKeys().reduce((a, b) => (a[b] = 0, a) , {}));
    for (const population of this.years[year - this.startYear].population) {
      pieData[population.type.name.toString()] = population.amount;
    }
    console.log(pieData);
    return pieData;
  }*/
  getDataForPie(year = this.startYear): PieItem[] {
    const samples = [];
    for (const population of this.years[year - this.startYear].population) {
      samples.push({
        name: population.type,
        value:  population.amount,
        abs: Math.abs(population.amount)
      });
    }
    console.log('pie data:', samples);
    return samples;
  }

  translation(x: number, y: number) {
    return 'translate(' + x + ',' + y + ')';

  }

  getMargins() {
    return {bottom: 0 , left: 0, middle: 0, right: 0, top: 0};
  }
  saveYear(year: number, data) {
    this.years[year] = data;
  }
  getGraph(year: number, nativeType: NativeType) {
    return this.years[year - this.startYear].getPopulation(nativeType);
  }
  saveGraph(year: number, type: Type , data: any[], nativeType: NativeType) {
      // über nativetype und year die Population finden oben
    const population = this.years[year - this.startYear].getPopulation(nativeType);
    if (type === Type.GENDER_DISTRIBUTION) {

    }
    if (type === Type.FERTILITY) {

    }
    if (type === Type.IMMIGRATION) {

    }
    if (type === Type.MORTALITY) {

    }
    if (type === Type.SUBSEQUENT_IMMIGRATION) {

    }
    // Fehler???

  }
  // value, boolean, setByUser

  // TODO: FIx machen bei eingabe, weil das ist es eh schon iteriert und das als
  getMaximumAmount() {
    let maximum = 0;
    for (let i = 0 ; i < this.years.length ; i++ ) {
      let max = 0;
      for ( let y = 0 ; y < this.years[i].population.length ; y++) {

        max += this.years[i].population[y].amount;


      }
      if (max > maximum) {
        maximum = max;
      }
    }
    return maximum;
  }

  getMaximumGenderAmount(year) {
    let maximum = 0;
    let maxF = 0;
    let maxM = 0;
    for ( let y = 0 ; y < this.years[year - this.startYear].population.length ; y++) {
        maxF += this.years[year - this.startYear].population[y].amountfemale;
        maxM += this.years[year - this.startYear].population[y].amountmale;

      }
    if (maxF > maximum) {
        maximum = maxF;
      }
    if (maxM > maximum) {
        maximum = maxM;
    }
    return maximum;

    }


}


/*

Standardwerte (Glpckenverteilugn) bekommen wir ncoh ; Feste WErte eingebbar udn
-------------------------
> Raten Wachsen Zwischen Eingaben müssen in der Dritten Dimension auch mitwachsen.

> Ausreisser müssten mit 3 JAhre (vorher ; JETZT ; Nachher ) angefasst werden

> > Anker setzen < <
<> Extra Ideen Aussreisser Jahre  <>
---------------------------------------

Fertilität : Fester Wert
> Standard Motherhood Verteilung
> Motherhood Tabelle : kontinuirlich
> Kopplung zwischen Fertilität UND Motherhood : Je Mehr desto Jünger (Presets)



Einwanderung : Fester Wert
AUswanderung : Fester Wert
> Glockenverteilung


Nachzug :
 < nach 3 Jahren Kinder unter 18 >
 < Nicht alle Formen Berücksichtigen >
 < Hinweis das Funktionen nicht alle abgedeckt werden ; sondern über Intake handel >


 */
