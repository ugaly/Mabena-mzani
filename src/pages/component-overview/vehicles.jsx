import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

import { InputNumber } from 'primereact/inputnumber';
import { Document, Page, pdfjs } from 'react-pdf';



import AuthService from 'services/AuthService';
import { all } from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';
import { setPowersetDependencies } from 'mathjs';
import SalesService from 'services/SalesService';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';

export default function Vehicles() {

    const [vehicleSales, setVehicleSales] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [truckNumber, setTruckNumber] = useState('');
    const [vehicleTypeslist, setVehicleTypesList] = useState([]);
    const [vehicleAxels, setVehicleAxcels] = useState([]);
    const [vehicleAxelsList, setVehicleAxcelsList] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [tableValue, setTableValue] = useState([]);
    const [selectedVehicleType, setSelectedVehicleType] = useState(null);
    const [salePrice, setSalePrice] = useState(0);
    const [pdfVisible, setPdfVisible] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState('');
    const [printDialogTitle, setPrintDialogTitle] = useState('');
    const [parentId, setParentId] = useState(0);



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        // Format date as "dd-MM-yyyy"
        const formattedDate = date.toLocaleDateString('en-GB').substring(0, 5); // UK format: day-month-year
        
        // Format time as "hh:mm AM/PM"
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        
        return `${formattedDate} ${formattedTime}`;
    };
    

    useEffect(() => {
        fetchVehicleSales();
        fetchVehicleTypes();
        fetchVehicleAxels();
        initFilters();
    }, []);

    const fetchVehicleSales = async () => {
        setLoading(true);
        try {
            const response = await AuthService.getVehicle();
            // setVehicles(response.data.results.content);
            // console.log(response.data.results.content);

            console.log(response.data.results);

            const vehiclesWithTypeOnly = response.data.results.content.map(vehicle => ({
                ...vehicle, // Keep the rest of the vehicle data
                vehicleType: vehicle.vehicleType.type, // Override vehicleType to only include 'type'
                vehicleTypeId: vehicle.vehicleType.id,
                createdTime: formatDate(vehicle.createdTime) // Format the created time

            }));
    
            setVehicleSales(vehiclesWithTypeOnly); 
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleTypes = async () => {
        try {
            setLoading(true);
            const response = await AuthService.getVehicleType();

            
            setLoading(false);
            const types = response.data.results.map(type => ({
                label: type.type,
                value: type.id
            }));
            setVehicleTypes(types);
            setVehicleTypesList(response.data.results);
        } catch (error) {
            console.error('Failed to fetch vehicle types:', error);
        }
    };

    const fetchVehicleAxels = async () => {
        try {
            setLoading(true);
            const response = await AuthService.getAxelGroup();
            setLoading(false);
            const axels = response.data.results.map(axel => ({ 
                label: axel.groupName, 
                value: axel.id 
            }));

            setVehicleAxcels(axels);
            setVehicleAxcelsList(response.data.results);
        } catch (error) {
            console.error('Failed to fetch vehicle types:', error);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: 'contains' },
        });
        setGlobalFilterValue('');
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                />
                <div>
                <Button style={{marginRight:'4px'}} type="button" icon="pi pi-plus" label="New Weigh" outlined onClick={() => {
                    setParentId(0)
                    setIsAdding(true)
                    setTableValue([])
                    setSelectedVehicleType(0)
                    setTruckNumber('')
                    
                }} />

                <Button type="button" icon="pi pi-receipt" label="Sales Report" outlined onClick={() => {
                    setParentId(0)
                    setIsAdding(true)
                    setTableValue([])
                    setSelectedVehicleType(0)
                    setTruckNumber('')
                    
                }} />
                </div>

                
            </div>
        );
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const actionBodyTemplate = (rowData) => {
        const overlayRef = useRef(null);

        const handleOverlayClick = (event) => {
            overlayRef.current.toggle(event);
        };

        const handleEdit = () => {
            console.log('Edit:', rowData);
            overlayRef.current.hide();
        };

        const handleDelete = () => {
            console.log('Delete:', rowData);
            setVehicleSales(vehicleSales.filter(v => v.id !== rowData.id));
            overlayRef.current.hide();
        };


        const handleRepeat = () => {
            console.log('Repeat:', rowData);
            setParentId(rowData.id);
            setTruckNumber(rowData.truckNumber);
            //selectedVehicleType(rowData.vehicleType);

            handleVehicleTypeChange(rowData.vehicleTypeId)
            setIsAdding(true)
        };
        const handlePrint = async () => {
            //console.log('Print:', rowData);

            setLoading(true)
            let receipt = await SalesService.getReceipt(rowData.id);
            setLoading(false)

            //console.log(receipt.data.file)

            const byteCharacters = atob(receipt.data.file.replace(/^data:application\/pdf;base64,/, ''));
            const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create a URL for the Blob
            const blobUrl = URL.createObjectURL(blob);

            // Open the Blob URL in a new window/tab
            const pdfWindow = window.open(blobUrl);

            // Wait for the window to fully load and then invoke the print function
            if (pdfWindow) {
            pdfWindow.onload = () => {
                pdfWindow.focus();  // Ensure the window is focused before printing
                pdfWindow.print();
            };
            }



            //setPrintDialogTitle(rowData.vehicleType+' - '+rowData.truckNumber)
            //setPdfDataUrl(receipt.data.file)
            //setPdfVisible(true)
        };

        return (
            // <div className="flex justify-content-center">
            //     <Button icon="pi pi-ellipsis-v" onClick={handleOverlayClick} className="p-button-text" />
            //     <OverlayPanel ref={overlayRef} showCloseIcon onHide={() => overlayRef.current.hide()}>
            //         <div className="flex flex-column">
                
            //             <Button icon="pi pi-pencil" label="Edit" className="p-button-text" onClick={handleEdit} />
            //             <Button icon="pi pi-trash" label="Delete" className="p-button-text" onClick={handleDelete} />
            //         </div>
            //     </OverlayPanel>
            // </div>

            <div className="flex justify-content-center">
                <div className="flex flex-row">
                
                    <Button icon="pi pi-refresh" label="ReWeigh" className="p-button-text" onClick={handleRepeat} />
                    <Button icon="pi pi-receipt" label="Receipt" className="p-button-text" onClick={handlePrint} />
                </div>

            </div>

        );
    };

    const handleVehicleTypeChange = (value) => {
       
        setTableValue([]);
        
        setSelectedVehicleType(value);

        vehicleTypeslist.forEach((type) => {
            if (type.id === value) {
                setSalePrice(type.price);
            }
        })
        setLoading(true);
        AuthService.getAxelsByVehicleId(value,parentId).then((response) => {
            setLoading(false);
            setTableValue(response.data.results);
        })
    };






    const getSeverity = (value) => {
        switch (value) {
            case 'Not Overload':
                return 'success';

            case 'LOWSTOCK':
                return 'warning';

            case 'Overload':
                return 'danger';

            default:
                return null;
        }
    };

    // const onRowEditComplete = (e) => {
    //     let _products = [...products];
    //     let { newData, index } = e;

    //     _products[index] = newData;

    //     setProducts(_products);
    // };

    const onRowEditComplete = (e) => {
        let updatedData = [...tableValue];
        let { newData, index } = e;
        console.log(newData);
    
        // Check if Axel Weight exceeds Weight Limit
        if (parseFloat(newData.name) > parseFloat(newData.weightLimit)) {
            newData.status = 'Overload';
        } else {
            newData.status = 'Not Overload';
        }
    
        updatedData[index] = newData;
        setTableValue(updatedData);
    };

    

    const setFromAxelGroup = (value,options) => {

        //console.log(value)
        options.editorCallback(value);
        
        let groupName = ''
        let weightLimit = 0

        vehicleAxelsList.forEach((axel) => {
            if (axel.id === value) {
                groupName = axel.groupName
                weightLimit = axel.weightLimit
            }
        })

        const updatedTableValues = [...tableValue];

        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], groupName: groupName };
        //updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], axelWeight: '' };

        let axelWeight = updatedTableValues[options.rowIndex].axelWeight
        let status = 'Not Overload'
        let overload = 0
        let allowance = weightLimit

        if(axelWeight>weightLimit){
            overload = axelWeight - weightLimit
            allowance = 0
            status = 'Overload'
        }

        if(axelWeight<weightLimit){
            allowance = weightLimit - axelWeight
            overload = 0
            status = 'Not Overload'
        }


        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], overload: overload };
        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], allowance: allowance };
        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], status: status };
        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], weightLimit: weightLimit };




        setTableValue(updatedTableValues);

        updateGVM(updatedTableValues)
    }

    const setWeights = (value,options) => {

        let data = options.rowData
        let weightLimit = data.weightLimit
        let overload = 0
        let allowance = 0
        let status = 'Not Overload'

        if(weightLimit<value){
            overload = value - weightLimit
            allowance = 0
            status = 'Overload'
        }

        if(weightLimit>value){
            allowance = weightLimit - value
            overload = 0
            status = 'Not Overload'
        }
        
        
        console.log(options)


        const updatedTableValues = [...tableValue];

        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], axelWeight: value };
        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], overload: overload };
        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], allowance: allowance };
        updatedTableValues[options.rowIndex] = { ...updatedTableValues[options.rowIndex], status: status };


        setTableValue(updatedTableValues);


        updateGVM(updatedTableValues)

        options.editorCallback(value)
    }
    
    
    const updateGVM = (updatedTableValues) => {
        let gvmRow = updatedTableValues.length -1
        let gvmAxelWeight = 0;
        

        updatedTableValues.forEach((row, index) => {
            if(index < gvmRow){
                if(row.axelWeight!==''){
                    gvmAxelWeight+=parseInt(row.axelWeight)
                }
            }
        })

        
        let gvmOverload = 0
        let gvmAllowance = 0
        let gvmStatus = 'Not Overload'


        let gvmWeightLimit=0;
        updatedTableValues.forEach((row, index) => {
            if(index < gvmRow){
                console.log(row)
                if(row.weightLimit!==''){
                    gvmWeightLimit+=parseInt(row.weightLimit)
                    gvmOverload+=parseInt(row.overload)
                    gvmAllowance+=parseInt(row.allowance)
                }
            }
        })




        if(gvmWeightLimit<gvmAxelWeight){
            //gvmOverload = gvmAxelWeight - gvmWeightLimit
            //gvmAllowance = 0
            gvmStatus = 'Overload'
        }

        if(gvmWeightLimit>gvmAxelWeight){
            //gvmAllowance = gvmWeightLimit - gvmAxelWeight
            //gvmOverload = 0
            gvmStatus = 'Not Overload'
        }

        updatedTableValues[gvmRow] = { ...updatedTableValues[gvmRow], axelWeight: gvmAxelWeight };
        updatedTableValues[gvmRow] = { ...updatedTableValues[gvmRow], weightLimit: gvmWeightLimit };
        updatedTableValues[gvmRow] = { ...updatedTableValues[gvmRow], overload: gvmOverload };
        updatedTableValues[gvmRow] = { ...updatedTableValues[gvmRow], allowance: gvmAllowance };
        updatedTableValues[gvmRow] = { ...updatedTableValues[gvmRow], status: gvmStatus };

        setTableValue(updatedTableValues);
    }

    const priceEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />;
    };

    const axelGroupBodyTemplate = (rowData) => {

        console.log(rowData)
        return returnAxelGroup(rowData.groupName);
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)}></Tag>;
    };

    const priceBodyTemplate = (rowData) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.price);
    };

    const allowEdit = (rowData) => {
        return rowData.name !== 'Blue Band';
    };

    


    const saveSales = () => {
        


        {/*const regex = /^T\d{3}[A-Z]{3}$/;
        if (!regex.test(truckNumber)) {
            alert('Please enter a valid Truck Number.');
            document.getElementById('trckNo').focus();
            return;
        }*/}

        let data =[]

        tableValue.forEach((row) => {
            if(row.groupName!==''){
                if(row.axelWeight!==''){
                    data.push(row)
                }
                
            }
            
        })
        if (data.length === 0) {
            alert('Please enter valid axel weight.');
            return;
        }

        let payload = {
            vehicleType: selectedVehicleType,
            truckNumber: truckNumber,
            salePrice: salePrice,
            axelsWeightList: data,
            parentId: parentId
        }

        if(!loading){
            setLoading(true);
            AuthService.setVehicle(payload).then((response) => {
                //console.log(response.data);

                cancelAdd()
                setLoading(false);
                setIsAdding(false);
                fetchVehicleSales();
            }).catch((error) => {
                console.log(error);
            })
        }
        



        //setIsAdding(false);

        //fetchVehicleSales()
    };

    const onRowClick = (event) => {
        console.log(event);
    };

    


    const renderFooter = () => (
        <div>
      <button onClick={() => setPdfVisible(false)} className="p-button">Close</button>
    </div>
    );

  const cancelAdd = () => {

        setParentId(0)
        setIsAdding(false)
        setTableValue([])
          
    }

    const rowClassName = (data) => {
        return data.hasChildren ? 'highlight-row' : '';
    };
    
    return (
        <div className="card">
            {isAdding ? (
                <div className="card shadow-2 p-4">

                    <h2 className="text-2xl font-bold mb-3" style={{ color: '#51baff' }}>Add New Sale</h2>

                    <div className="flex flex-wrap gap-4 mb-3">
                        {/* Vehicle Type Field */}
                        <div
                            className="flex flex-column"
                            style={{
                                flex: 1,
                                padding: '16px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <label htmlFor="vehicleType" className="font-semibold">Vehicle Type</label>
                            <Dropdown
                                id="vehicleType"
                                value={selectedVehicleType}
                                options={vehicleTypes}
                                onChange={(e) => handleVehicleTypeChange(e.value)}
                                placeholder="Select vehicle type"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Truck Number Field */}
                        <div
                            className="flex flex-column"
                            style={{
                                flex: 1,
                                padding: '16px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <label htmlFor="gvmAxelWeight" className="font-semibold">Truck Number</label>
                            <InputText
                                id="trckNo"
                                maxLength={7}
                                value={truckNumber}
                                onChange={(e) => {setTruckNumber( e.target.value.toUpperCase() )}}
                                placeholder="T000XXX"
                                style={{ width: '100%', height: '80%' }}
                            />
                        </div>
                    </div>

                    {tableValue.length === 0 && (
                        <div className="flex justify-content-end" style={{margin:'30px 2px'}}>
                            <Button type="button" style={{width: '100px'}} icon="pi pi-times" label="Cancel" outlined onClick={cancelAdd} />
                        </div>
                    )}
                    
                    {tableValue.length > 0 && (
                        <div className="card p-fluid"
                            style={{
                                flex: 1,
                                padding: '16px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                           
                            <DataTable  showGridlines 
                                value={tableValue} editMode="cell" dataKey="tb_add_sales" 
                                onRowEditComplete={onRowEditComplete} tableStyle={{ minWidth: '50rem' }}>
                                
                                <Column key={'groupName'}
                                    headerStyle={{ textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center',width: '100%' }}  

                                    bodyStyle={{ textAlign: 'center' }} 
                                    field="groupName" header="Axel Group"  
                                    editor={(options) => <Dropdown
                                        value={options.value}
                                        options={vehicleAxels}
                                        onChange={(e) => {
                                            options.editorCallback(e.value);setFromAxelGroup(e.value,options)}}
                                        placeholder="Select Axel Group"
                                        
                                    />} 
                                    style={{ width: '20%' }}/>

                                <Column key={'axelWeight'}
                                    headerStyle={{ textAlign: 'center' }} 
                                    bodyStyle={{ textAlign: 'center' }} 
                                    field="axelWeight" header="Axel Weight" 
                                    editor={(options) => 
                                        <InputText type="text" value={options.value} onChange={(e) => setWeights(e.target.value,options)} />
                                    } 
                                    style={{ width: '20%' }}/>
                                
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="weightLimit" header="Weight Limit" style={{ width: '20%' }}/>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="status" header="Status" body={statusBodyTemplate} style={{ width: '20%' }}/>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="overload" header="OverLoad"  style={{ width: '20%' }}/>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="allowance" header="Allowance" style={{ width: '20%' }}/>
                                
                                
                            </DataTable>

                            {loading?<ProgressBar mode="indeterminate" />:''}


                            <div className="flex justify-content-end" style={{marginTop:'30px'}}>
                                
                                <span style={{margin:'10px 20px',fontWeight:'bold'}}>Price : {salePrice}</span>
                                {loading?'Please Wait...':<Button type="button" style={{width: '100px',marginRight:'10px'}} icon="pi pi-save" label="Save"  onClick={() => saveSales()} />}
                                
                                
                                <Button type="button" style={{width: '100px'}} icon="pi pi-times" label="Cancel" outlined onClick={cancelAdd} />
                            </div>

                        </div>

                    )}




                </div>
            ) : (
                <DataTable
                    value={vehicleSales}
                    paginator
                    showGridlines
                    rows={10}
                    loading={loading}
                    filters={filters}
                    globalFilterFields={['date']}
                    header={renderHeader()}
                    tableStyle={{ minWidth: '60rem' }}
                    emptyMessage="Loading..."
                    onRowClick={onRowClick} 
                    rowClassName={rowClassName}
                >
                    <Column field="createdTime" header="Date" />
                    <Column field="truckNumber" header="Truck Number" />
                    <Column field="vehicleType" header="Vehicle Type" />
                    <Column field="gvmAxelWeight" header="GVM Axel Weight" />
                    <Column field="gvmWeightLimit" header="GVM Weight Limit" />
                    <Column field="gvmWeightStatus" header="Status" />
                    <Column field="gvmOverload" header="GVN Overload" />
                    <Column field="gvmAllowance" header="GVM Allowance" />
                    <Column header="Action" body={actionBodyTemplate} />

                </DataTable>
            )}



<Dialog onClose={() => setPdfVisible(false)} open={pdfVisible} 
    aria-labelledby="scroll-dialog-title" style={{width:'75vw'}}
    aria-describedby="scroll-dialog-description">
  <Grid
  sx={{ p: 1, py: 1.5 }}
    container
    spacing={2}
    justifyContent="space-between"
    alignItems="center"
    
  >
    <Grid item>
      <DialogTitle>{printDialogTitle}</DialogTitle>
    </Grid>
    <Grid item sx={{ mr: 1.5 }}>
      <IconButton color="secondary" onClick={()=>setPdfVisible(false)}>
        <CloseOutlined />
      </IconButton>
    </Grid>
  </Grid>

    <embed src={pdfDataUrl} type="application/pdf" width="100%" height="500px" />

  
</Dialog>



        </div>
    );
}
