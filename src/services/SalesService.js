import API from './Auth';


export default class SalesService{
    
    static async getReceipt(saleId){
        try {
            return await API.ax.get(`reports/print/weight-sale?saleId=${saleId}`);
        } catch (e) {
            return console.log(e);
        }
    } 

    
   
   
}