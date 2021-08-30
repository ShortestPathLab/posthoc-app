class InjectorService{
  constructor(){
      this.dependencies = {};
  }
  register(key, value){
    this.dependencies[key] = value;
  }
  inject(context, keys){
    keys.forEach((key) => {
      context[key] = this.dependencies[key];
    });
  }
}
let Injector = new InjectorService();
export default Injector;
