export enum generatedType {
  surviverate,
  emigrationsrate,
  immigrationsrate,
  birthrate,
  amount,
  reunification
}
export class Gender {

  private _age: number;
  private _surviverate: number;
  private _surviverate_generated : boolean ;
  private _emigrationsrate: number;
  private _emigrationsrate_generated : boolean ;
  private _immigration: number;
  private _immigration_generated : boolean;
  private _birthrate: number;
  private _birthrate_generated : boolean;
  private _amount: number;
  private _amount_generated : boolean;
  private _male: boolean;
  private _reunification: number;
  private _reunification_generated : boolean;

  private _amount_reunification: number;
  private _surviverate_flag: boolean;


  private _emigration_flag: boolean;
  private _immigration_flag: boolean;
  private _reunification_flag: boolean;
  private _birthrate_flag: boolean;
  private _amount_flag: boolean;

  constructor(age: number, surviverate = 0, migrationrate= 0, birthrate= 0, amount= 0, male= true , immigration = 0,
              reunification = 0, generated = false , type: generatedType = -1) {
    this._age = age;
    this._surviverate = surviverate;
    this._emigrationsrate = migrationrate;
    this._birthrate = birthrate;
    this._amount = amount;
    this._male = male;
    this._immigration = immigration;
    this._reunification = reunification;
    this._amount_reunification = 0;
    this._surviverate_generated = true;
    this._emigrationsrate_generated = true;
    this._birthrate_generated = true;
    this._reunification_generated = true;
    this._amount_generated = true;
    this._immigration_generated = true;

    this._birthrate_flag = true;
    this._surviverate_flag = true;
    this._emigration_flag = true;
    this._immigration_flag = true;
    this._reunification_flag = true;
    this._birthrate_flag = true;
    this._amount_flag = true;

  }
  /*
  Getter & Setter
   */
  get amount_reunification(): number {
    return this._amount_reunification;
  }

  set amount_reunification(value: number) {
    this._amount_reunification = value;
  }

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    this._age = value;
  }

  get surviverate(): number {
    return this._surviverate;
  }

  set surviverate(value: number) {
    this._surviverate = value;
  }

  get emigrationsrate(): number {
    return this._emigrationsrate;
  }

  set emigrationsrate(value: number) {
    this._emigrationsrate = value;
  }

  get immigration(): number {
    return this._immigration;
  }

  set immigration(value: number) {
    this._immigration = value;
  }

  get birthrate(): number {
    return this._birthrate;
  }

  set birthrate(value: number) {
    this._birthrate = value;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = value;
  }

  get male(): boolean {
    return this._male;
  }

  set male(value: boolean) {
    this._male = value;
  }

  get reunification(): number {
    return this._reunification;
  }

  set reunification(value: number) {
    this._reunification = value;
  }
  get surviverate_generated(): boolean {
    return this._surviverate_generated;
  }

  set surviverate_generated(value: boolean) {
    this._surviverate_generated = value;
  }

  get emigrationsrate_generated(): boolean {
    return this._emigrationsrate_generated;
  }

  set emigrationsrate_generated(value: boolean) {
    this._emigrationsrate_generated = value;
  }

  get immigration_generated(): boolean {
    return this._immigration_generated;
  }

  set immigration_generated(value: boolean) {
    this._immigration_generated = value;
  }

  get birthrate_generated(): boolean {
    return this._birthrate_generated;
  }

  set birthrate_generated(value: boolean) {
    this._birthrate_generated = value;
  }

  get amount_generated(): boolean {
    return this._amount_generated;
  }

  set amount_generated(value: boolean) {
    this._amount_generated = value;
  }

  get reunification_generated(): boolean {
    return this._reunification_generated;
  }

  set reunification_generated(value: boolean) {
    this._reunification_generated = value;
  }
  get surviverate_flag(): boolean {
    return this._surviverate_flag;
  }

  set surviverate_flag(value: boolean) {
    this._surviverate_flag = value;
  }

  get emigration_flag(): boolean {
    return this._emigration_flag;
  }

  set emigration_flag(value: boolean) {
    this._emigration_flag = value;
  }

  get immigration_flag(): boolean {
    return this._immigration_flag;
  }

  set immigration_flag(value: boolean) {
    this._immigration_flag = value;
  }

  get reunification_flag(): boolean {
    return this._reunification_flag;
  }

  set reunification_flag(value: boolean) {
    this._reunification_flag = value;
  }

  get birthrate_flag(): boolean {
    return this._birthrate_flag;
  }

  set birthrate_flag(value: boolean) {
    this._birthrate_flag = value;
  }

  get amount_flag(): boolean {
    return this._amount_flag;
  }

  set amount_flag(value: boolean) {
    this._amount_flag = value;
  }

  getGender() {
    return this._male ? 'Männlich' : 'Weiblich';
  }
  setallFlags(flag = true){
    this.reunification_flag = flag;
    this.immigration_flag = flag;
    this.birthrate_flag = flag;
    this.emigration_flag = flag;
    this.surviverate_flag = flag;
    this.amount_flag = flag;
  }

}
