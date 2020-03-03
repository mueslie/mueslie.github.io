
import {Gender} from './gender';
import {of} from 'rxjs';
import {NativeType} from './native-type';

export class Population {
  get amountmale(): number {
    return this._amountmale;
  }

  get amountfemale(): number {
    return this._amountfemale;
  }

  private _year: number;
  private _type: NativeType;
  private _amount: number;
  private _male: Gender[];
  private _amountmale: number;
  private _female: Gender[];
  private _amountfemale: number;
  private _immigration: number;
  private _immigration_female: number;
  private _immigration_male: number;
  private _birth_amount: number;
  // fertility in female gespeichert

  constructor(year: number, type: NativeType, immigration: number = 0) {
    this._year = year;
    this._type = type;
    this._male = [];
    this._female = [];
    this._amount = 0;
    this._amountfemale = 0;
    this._amountmale = 0;
    this._immigration = immigration;
    this._immigration_female = 0;
    this._immigration_male = 0;
    this._birth_amount = 1;

  }

  pushFemale(female: Gender) {
    this._female.push(female);
    this._amountfemale += female.amount;
  }
  pushMale(male: Gender) {
    this._male.push(male);
    this._amountmale += male.amount;
  }
  calculateAmount() {
    let amount = 0;

    for ( const m of this.male) {
      amount += m.amount;
    }
    this._amountmale = amount;
    amount = 0;
    for ( const f of this.female) {
      amount += f.amount;
    }
    this._amountfemale = amount;
    this._amount = this._amountmale + this._amountfemale;
  }
/*
Getter & Setter
 */
  get year(): number {
    return this._year;
  }

  set year(value: number) {
    this._year = value;
  }

  get type(): NativeType {
    return this._type;
  }

  get immigration_female(): number {
    return this._immigration_female;
  }

  set immigration_female(value: number) {
    this._immigration_female = value;
  }

  get immigration_male(): number {
    return this._immigration_male;
  }

  set immigration_male(value: number) {
    this._immigration_male = value;
  }

  set type(value: NativeType) {
    this._type = value;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = value;
  }

  public get male(): Gender[] {
    return this._male;
  }

  public set male(value: Gender[]) {
    this._male = value;
  }

  public get female(): Gender[] {
    return this._female;
  }

  public set female(value: Gender[]) {
    this._female = value;
  }

  get immigration(): number {
    return this._immigration;
  }

  set immigration(value: number) {
    this._immigration = value;
  }

  get birth_amount(): number {
    return this._birth_amount;
  }

  set birth_amount(value: number) {
    this._birth_amount = value;
  }
}
