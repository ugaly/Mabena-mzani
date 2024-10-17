import API from './Auth';


export default class AuthService{
    static login(payload){
        return API.ax.post('/auth/2/token',payload).catch(e=>console.log(e))
    }


    static getAxelGroup(){
        return API.ax.get(`setups/read/list/axel-group`).catch(e=>console.log(e))
    } 

    static setAxelGroup(payload){
        return API.ax.post(`setups/create/axel-group`,payload).catch(e=>console.log(e))
    }


    static getVehicleType(){
        return API.ax.get(`setups/read/list/vehicle-type`).catch(e=>console.log(e))
    } 

    static setVehicleType(payload){
        return API.ax.post(`setups/create/vehicle-type`,payload).catch(e=>console.log(e))
    }



    static getVehicle(){
        return API.ax.get(`sales/read/list/sales`).catch(e=>console.log(e))
    } 

    static setVehicle(payload){
        return API.ax.post(`sales/create/sales`,payload).catch(e=>console.log(e))
    }

    static getAxelsByVehicleId(id){
        return API.ax.get(`sales/read/axel/by/vehicle-type?vehicleTypeId=${id}`).catch(e=>console.log(e))
    } 
   
   
}