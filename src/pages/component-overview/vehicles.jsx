import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';

import AuthService from 'services/Api';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [tableValue, setTableValue] = useState([]);
    const [newVehicle, setNewVehicle] = useState({
        vehicleType: '',
        gvmAxelWeight: '',
        gvmWeightLimit: '',
        status: '',
        gvnOverload: '',
        gvmAllowance: ''
    });


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        // Format date as "dd-MM-yyyy"
        const formattedDate = date.toLocaleDateString('en-GB'); // UK format: day-month-year
        
        // Format time as "hh:mm AM/PM"
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        
        return `${formattedDate} (${formattedTime})`;
    };
    

    useEffect(() => {
        fetchVehicles();
        fetchVehicleTypes();
        initFilters();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await AuthService.getVehicle();
            // setVehicles(response.data.results.content);
            // console.log(response.data.results.content);

            const vehiclesWithTypeOnly = response.data.results.content.map(vehicle => ({
                ...vehicle, // Keep the rest of the vehicle data
                vehicleType: vehicle.vehicleType.type, // Override vehicleType to only include 'type'
                createdTime: formatDate(vehicle.createdTime) // Format the created time

            }));
    
            setVehicles(vehiclesWithTypeOnly); 
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleTypes = async () => {
        try {
            const response = await AuthService.getVehicleType();
            const types = response.data.results.map(type => ({
                label: type.type,
                value: type.id
            }));
            setVehicleTypes(types);
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
                <Button type="button" icon="pi pi-plus" label="Add" outlined onClick={() => setIsAdding(true)} />
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

    const handleAddVehicle = async () => {
        try {
            await AuthService.setVehicle(newVehicle);
            setNewVehicle({
                vehicleType: '',
                gvmAxelWeight: '',
                gvmWeightLimit: '',
                status: '',
                gvnOverload: '',
                gvmAllowance: ''
            });
            fetchVehicles(); // Refresh the list
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to add vehicle:', error);
        }
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
            setVehicles(vehicles.filter(v => v.id !== rowData.id));
            overlayRef.current.hide();
        };

        return (
            <div className="flex justify-content-center">
                <Button icon="pi pi-ellipsis-v" onClick={handleOverlayClick} className="p-button-text" />
                <OverlayPanel ref={overlayRef} showCloseIcon onHide={() => overlayRef.current.hide()}>
                    <div className="flex flex-column">
                        <Button icon="pi pi-pencil" label="Edit" className="p-button-text" onClick={handleEdit} />
                        <Button icon="pi pi-trash" label="Delete" className="p-button-text" onClick={handleDelete} />
                    </div>
                </OverlayPanel>
            </div>
        );
    };

    const handleVehicleTypeChange = (value) => {
        // setNewVehicle({ ...newVehicle, vehicleType: value });
        setTableValue([]);
        console.log(value);
        AuthService.getAxelsByVehicleId(value).then((response) => {
            console.log(response.data.results);
            setTableValue(response.data.results);
        })
    };






    const ProductService = [
        {
            id: '1000',
            code: 'f230fh0g3',
            name: 'Bamboo Watch',
            description: 'Product Description',
            image: 'bamboo-watch.jpg',
            price: 65,
            category: 'Accessories',
            quantity: 24,
            inventoryStatus: 'INSTOCK',
            rating: 5
        },
        {
            id: '1001',
            code: 'nvklal433',
            name: 'Black Watch',
            description: 'Product Description',
            image: 'black-watch.jpg',
            price: 72,
            category: 'Accessories',
            quantity: 61,
            inventoryStatus: 'INSTOCK',
            rating: 4
        },
        {
            id: '1002',
            code: 'zz21cz3c1',
            name: 'Blue Band',
            description: 'Product Description',
            image: 'blue-band.jpg',
            price: 79,
            category: 'Fitness',
            quantity: 2,
            inventoryStatus: 'LOWSTOCK',
            rating: 3
        }
    ];




    const [products, setProducts] = useState(ProductService);
    const [statuses] = useState(['INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK']);

    // useEffect(() => {
    //     ProductService.then((data) => setProducts(data));
    // }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const statusEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select a Status"
                itemTemplate={(option) => {
                    return <Tag value={option} severity={getSeverity(option)}></Tag>;
                }}
            />
        );
    };

    const priceEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />;
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

    



    return (
        <div className="card">
            {isAdding ? (
                <div className="card shadow-2 p-4">
                    <h2 className="text-2xl font-bold mb-3" style={{ color: '#51baff' }}>Add New Vehicle</h2>

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
                                value={newVehicle.vehicleType}
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
                                id="gvmAxelWeight"
                                value={newVehicle.vehicleType}
                                onChange={(e) => setNewVehicle({ ...newVehicle, gvmAxelWeight: e.target.value })}
                                placeholder="T000XXX"
                                style={{ width: '100%', height: '80%' }}
                            />
                        </div>
                    </div>




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
                            <DataTable  showGridlines value={tableValue} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete} tableStyle={{ minWidth: '50rem' }}>
                                <Column headerStyle={{ textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center',width: '100%' }}  bodyStyle={{ textAlign: 'center' }} field="inventoryStatus" header="Axel Group" body={statusBodyTemplate} editor={(options) => statusEditor(options)} style={{ width: '20%' }}></Column>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="name" header="Axel Weight" editor={(options) => textEditor(options)} style={{ width: '20%' }}></Column>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="weightLimit" header="Weight Limit" style={{ width: '20%' }}></Column>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="status" header="Status" body={statusBodyTemplate} style={{ width: '20%' }}></Column>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="overload" header="OverLoad"  style={{ width: '20%' }}></Column>
                                <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="Allowance" header="Allowance" style={{ width: '20%' }}></Column>
                                <Column  rowEditor={allowEdit} headerStyle={{ width: '10%', minWidth: '8rem', textAlign: 'center', justifyContent: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                            </DataTable>
                        </div>

                    )}




                </div>
            ) : (
                <DataTable
                    value={vehicles}
                    paginator
                    showGridlines
                    rows={10}
                    loading={loading}
                    filters={filters}
                    globalFilterFields={['date']}
                    header={renderHeader()}
                    tableStyle={{ minWidth: '60rem' }}
                    emptyMessage="No vehicles found."
                >
                    <Column field="createdTime" header="Date" />
                    <Column field="truckNumber" header="Track Number" />
                    <Column field="vehicleType" header="Vehicle Type" />
                    <Column field="gvmAxelWeight" header="GVM Axel Weight" />
                    <Column field="gvmWeightLimit" header="GVM Weight Limit" />
                    <Column field="gvmWeightStatus" header="Status" />
                    <Column field="gvmOverload" header="GVN Overload" />
                    <Column field="gvmAllowance" header="GVM Allowance" />
                    <Column field="salePrice" header="Sale Price" />
                    <Column header="Action" body={actionBodyTemplate} />
                </DataTable>
            )}
        </div>
    );
}













// import React, { useState, useEffect, useRef } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Dropdown } from 'primereact/dropdown';
// import { OverlayPanel } from 'primereact/overlaypanel';
// import { InputNumber } from 'primereact/inputnumber';
// import { Tag } from 'primereact/tag';
// import AuthService from 'services/Api';

// export default function Vehicles() {
//     const [vehicles, setVehicles] = useState([]);
//     const [vehicleTypes, setVehicleTypes] = useState([]);
//     const [filters, setFilters] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [globalFilterValue, setGlobalFilterValue] = useState('');
//     const [isAdding, setIsAdding] = useState(false);
//     const [tableValue, setTableValue] = useState([]);
//     const [newVehicle, setNewVehicle] = useState({
//         vehicleType: '',
//         gvmAxelWeight: '',
//         gvmWeightLimit: '',
//         status: '',
//         gvnOverload: '',
//         gvmAllowance: ''
//     });

//     useEffect(() => {
//         fetchVehicles();
//         fetchVehicleTypes();
//         initFilters();
//     }, []);

//     const fetchVehicles = async () => {
//         setLoading(true);
//         try {
//             const response = await AuthService.getVehicle();
//             setLoading(false);
//         } catch (error) {
//             console.error('Failed to fetch vehicles:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchVehicleTypes = async () => {
//         try {
//             const response = await AuthService.getVehicleType();
//             const types = response.data.results.map(type => ({
//                 label: type.type,
//                 value: type.id
//             }));
//             setVehicleTypes(types);
//         } catch (error) {
//             console.error('Failed to fetch vehicle types:', error);
//         }
//     };

//     const initFilters = () => {
//         setFilters({
//             global: { value: null, matchMode: 'contains' },
//         });
//         setGlobalFilterValue('');
//     };

//     const renderHeader = () => {
//         return (
//             <div className="flex justify-content-between">
//                 <InputText
//                     value={globalFilterValue}
//                     onChange={onGlobalFilterChange}
//                     placeholder="Keyword Search"
//                 />
//                 <Button type="button" icon="pi pi-plus" label="Add" outlined onClick={() => setIsAdding(true)} />
//             </div>
//         );
//     };

//     const onGlobalFilterChange = (e) => {
//         const value = e.target.value;
//         let _filters = { ...filters };
//         _filters['global'].value = value;

//         setFilters(_filters);
//         setGlobalFilterValue(value);
//     };

//     const handleAddVehicle = async () => {
//         try {
//             await AuthService.setVehicle(newVehicle);
//             setNewVehicle({
//                 vehicleType: '',
//                 gvmAxelWeight: '',
//                 gvmWeightLimit: '',
//                 status: '',
//                 gvnOverload: '',
//                 gvmAllowance: ''
//             });
//             fetchVehicles(); // Refresh the list
//             setIsAdding(false);
//         } catch (error) {
//             console.error('Failed to add vehicle:', error);
//         }
//     };

//     const handleVehicleTypeChange = (value) => {
//         setTableValue([]);
//         console.log(value);
//         AuthService.getAxelsByVehicleId(value).then((response) => {
//             console.log(response.data.results);
//             setTableValue(response.data.results);
//         })
//     };

//     const textEditor = (options) => {
//         return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
//     };

//     const statusBodyTemplate = (rowData) => {
//         return <Tag value={rowData.status} severity={getSeverity(rowData.status)}></Tag>;
//     };

//     const statusEditor = (options) => {
//         return (
//             <Dropdown
//                 value={options.value}
//                 options={['Not Overload', 'Overload']}
//                 onChange={(e) => options.editorCallback(e.value)}
//                 placeholder="Select a Status"
//                 itemTemplate={(option) => {
//                     return <Tag value={option} severity={getSeverity(option)}></Tag>;
//                 }}
//             />
//         );
//     };

//     const getSeverity = (value) => {
//         switch (value) {
//             case 'Not Overload':
//                 return 'success';

//             case 'Overload':
//                 return 'danger';

//             default:
//                 return null;
//         }
//     };

//     const onRowEditComplete = (e) => {
//         let _tableValue = [...tableValue];
//         let { newData, index } = e;

//         // Check if entered Axel Weight is greater than the Weight Limit
//         if (parseFloat(newData.name) > parseFloat(newData.weightLimit)) {
//             newData.status = 'Overload'; // Update status to 'Overload'
//         } else {
//             newData.status = 'Not Overload'; // Reset to 'Not Overload'
//         }

//         _tableValue[index] = newData;
//         setTableValue(_tableValue); // Update the table values
//     };

//     const allowEdit = (rowData) => {
//         return rowData.name !== 'Blue Band'; // Modify if needed
//     };

//     return (
//         <div className="card">
//             {isAdding ? (
//                 <div className="card shadow-2 p-4">
//                     <h2 className="text-2xl font-bold mb-3" style={{ color: '#51baff' }}>Add New Vehicle</h2>

//                     <div className="flex flex-wrap gap-4 mb-3">
//                         {/* Vehicle Type Field */}
//                         <div
//                             className="flex flex-column"
//                             style={{
//                                 flex: 1,
//                                 padding: '16px',
//                                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                                 borderRadius: '8px',
//                                 backgroundColor: '#fff',
//                                 border: '1px solid #e0e0e0'
//                             }}
//                         >
//                             <label htmlFor="vehicleType" className="font-semibold">Vehicle Type</label>
//                             <Dropdown
//                                 id="vehicleType"
//                                 value={newVehicle.vehicleType}
//                                 options={vehicleTypes}
//                                 onChange={(e) => handleVehicleTypeChange(e.value)}
//                                 placeholder="Select vehicle type"
//                                 style={{ width: '100%' }}
//                             />
//                         </div>

//                         {/* Truck Number Field */}
//                         <div
//                             className="flex flex-column"
//                             style={{
//                                 flex: 1,
//                                 padding: '16px',
//                                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                                 borderRadius: '8px',
//                                 backgroundColor: '#fff',
//                                 border: '1px solid #e0e0e0'
//                             }}
//                         >
//                             <label htmlFor="gvmAxelWeight" className="font-semibold">Truck Number</label>
//                             <InputText
//                                 id="gvmAxelWeight"
//                                 value={newVehicle.vehicleType}
//                                 onChange={(e) => setNewVehicle({ ...newVehicle, gvmAxelWeight: e.target.value })}
//                                 placeholder="T000XXX"
//                                 style={{ width: '100%', height: '80%' }}
//                             />
//                         </div>
//                     </div>

//                     {tableValue.length > 0 && (
//                         <div className="card p-fluid"
//                             style={{
//                                 flex: 1,
//                                 padding: '16px',
//                                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                                 borderRadius: '8px',
//                                 backgroundColor: '#fff',
//                                 border: '1px solid #e0e0e0'
//                             }}
//                         >
//                             <DataTable showGridlines value={tableValue} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete} tableStyle={{ minWidth: '50rem' }}>
//                                 <Column headerStyle={{ textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', width: '100%' }} bodyStyle={{ textAlign: 'center' }} field="inventoryStatus" header="Axel Group" body={statusBodyTemplate} editor={(options) => statusEditor(options)} style={{ width: '20%' }}></Column>
//                                 <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="name" header="Axel Weight" editor={(options) => textEditor(options)} style={{ width: '20%' }}></Column>
//                                 <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="weightLimit" header="Weight Limit" style={{ width: '20%' }}></Column>
//                                 <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} field="status" header="Status" body={statusBodyTemplate} style={{ width: '20%' }}></Column>
//                                 <Column headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }} rowEditor header="Edit" style={{ width: '10%' }}></Column>
//                                  {/* <Column
//                                     headerStyle={{ textAlign: 'center' }}
//                                     bodyStyle={{ textAlign: 'center' }}
//                                     header="Actions"
//                                     rowEditor
                                    
//                                     body={(rowData, { rowIndex }) => (
//                                         rowIndex === tableValue.length - 1 ? null : (
//                                             <Button icon="pi pi-pencil" className="p-button-text" />
//                                         )
//                                     )}
//                                     style={{ width: '20%' }}
//                                 /> */}
//                             </DataTable>
//                         </div>
//                     )}
//                     <div className="mt-4">
//                         <Button label="Submit" className="mr-2" onClick={handleAddVehicle} />
//                         <Button label="Cancel" className="p-button-secondary" onClick={() => setIsAdding(false)} />
//                     </div>
//                 </div>
//             ) : (
//                 <>
//                     <h1 style={{ color: '#51baff' }}>Vehicles</h1>
//                     <div className="card shadow-2">
//                         <DataTable value={vehicles} paginator rows={10} dataKey="id" filters={filters} loading={loading} globalFilterFields={['name', 'code', 'inventoryStatus']} header={renderHeader} emptyMessage="No vehicles found.">
//                             <Column field="name" header="Name" style={{ width: '25%' }} />
//                             <Column field="code" header="Code" style={{ width: '25%' }} />
//                             <Column field="inventoryStatus" header="Status" body={statusBodyTemplate} style={{ width: '25%' }} />
//                         </DataTable>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }















// import React, { useState, useEffect } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Dropdown } from 'primereact/dropdown';
// import { Tag } from 'primereact/tag';
// import AuthService from 'services/Api';

// export default function Vehicles() {
//     const [vehicles, setVehicles] = useState([]);
//     const [vehicleTypes, setVehicleTypes] = useState([]);
//     const [filters, setFilters] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [globalFilterValue, setGlobalFilterValue] = useState('');
//     const [isAdding, setIsAdding] = useState(false);
//     const [tableValue, setTableValue] = useState([]);
//     const [newVehicle, setNewVehicle] = useState({
//         vehicleType: '',
//         gvmAxelWeight: '',
//         gvmWeightLimit: '',
//         status: '',
//         gvnOverload: '',
//         gvmAllowance: ''
//     });

//     useEffect(() => {
//         fetchVehicles();
//         fetchVehicleTypes();
//         initFilters();
//     }, []);

//     const fetchVehicles = async () => {
//         setLoading(true);
//         try {
//             const response = await AuthService.getVehicle();
//             // setVehicles(response.data.results);
//         } catch (error) {
//             console.error('Failed to fetch vehicles:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchVehicleTypes = async () => {
//         try {
//             const response = await AuthService.getVehicleType();
//             const types = response.data.results.map(type => ({
//                 label: type.type,
//                 value: type.id
//             }));
//             setVehicleTypes(types);
//         } catch (error) {
//             console.error('Failed to fetch vehicle types:', error);
//         }
//     };

//     const initFilters = () => {
//         setFilters({
//             global: { value: null, matchMode: 'contains' },
//         });
//         setGlobalFilterValue('');
//     };

//     const renderHeader = () => {
//         return (
//             <div className="flex justify-content-between">
//                 <InputText
//                     value={globalFilterValue}
//                     onChange={onGlobalFilterChange}
//                     placeholder="Keyword Search"
//                 />
//                 <Button type="button" icon="pi pi-plus" label="Add" outlined onClick={() => setIsAdding(true)} />
//             </div>
//         );
//     };

//     const onGlobalFilterChange = (e) => {
//         const value = e.target.value;
//         let _filters = { ...filters };
//         _filters['global'].value = value;

//         setFilters(_filters);
//         setGlobalFilterValue(value);
//     };

//     const handleAddVehicle = async () => {
//         try {
//             await AuthService.setVehicle(newVehicle);
//             setNewVehicle({
//                 vehicleType: '',
//                 gvmAxelWeight: '',
//                 gvmWeightLimit: '',
//                 status: '',
//                 gvnOverload: '',
//                 gvmAllowance: ''
//             });
//             fetchVehicles(); // Refresh the list
//             setIsAdding(false);
//         } catch (error) {
//             console.error('Failed to add vehicle:', error);
//         }
//     };

//     const handleVehicleTypeChange = (value) => {
//         setTableValue([]);
//         AuthService.getAxelsByVehicleId(value).then((response) => {
//             setTableValue(response.data.results);
//             console.log(response.data);
//         });
//     };

//     const textEditor = (options) => {
//         return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
//     };

//     const statusBodyTemplate = (rowData) => {
//         return <Tag value={rowData.status} severity={getSeverity(rowData.status)}></Tag>;
//     };

//     const statusEditor = (options) => {
//         return (
//             <Dropdown
//                 value={options.value}
//                 options={['Not Overload', 'Overload']}
//                 onChange={(e) => options.editorCallback(e.value)}
//                 placeholder="Select a Status"
//                 itemTemplate={(option) => {
//                     return <Tag value={option} severity={getSeverity(option)}></Tag>;
//                 }}
//             />
//         );
//     };

//     const getSeverity = (value) => {
//         switch (value) {
//             case 'Not Overload':
//                 return 'success';
//             case 'Overload':
//                 return 'danger';
//             default:
//                 return null;
//         }
//     };

//     const onRowEditComplete = (e) => {
//         const { newData, index } = e;

//         // Prevent editing the last row
//         if (index === tableValue.length - 1) {
//             return; // Do not update if editing the total row
//         }

//         // Check if entered Axel Weight is greater than the Weight Limit
//         if (parseFloat(newData.name) > parseFloat(newData.weightLimit)) {
//             newData.status = 'Overload'; // Update status to 'Overload'
//         } else {
//             newData.status = 'Not Overload'; // Reset to 'Not Overload'
//         }

//         const _tableValue = [...tableValue];
//         _tableValue[index] = newData;
//         setTableValue(_tableValue); // Update the table values
//     };

//     const calculateTotals = () => {
//         let totalAxelWeight = 0;
//         tableValue.forEach(row => {
//             if (row.weightLimit) {
//                 totalAxelWeight += parseFloat(row.name) || 0; // Sum the axel weights
//             }
//         });
//         return totalAxelWeight;
//     };

//     const totalRow = {
//         id: 'total',
//         name: 'Total',
//         weightLimit: '', // Total row will not have a weight limit field
//         status: '', // No status for the total row
//         totalAxelWeight: calculateTotals()
//     };

//     return (
//         <div className="card">
//             {isAdding ? (
//                 <div className="card shadow-2 p-4">
//                     <h2 className="text-2xl font-bold mb-3" style={{ color: '#51baff' }}>Add New Vehicle</h2>

//                     <div className="flex flex-wrap gap-4 mb-3">
//                         {/* Vehicle Type Field */}
//                         <div className="flex flex-column" style={{ flex: 1, padding: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
//                             <label htmlFor="vehicleType" className="font-semibold">Vehicle Type</label>
//                             <Dropdown
//                                 id="vehicleType"
//                                 value={newVehicle.vehicleType}
//                                 options={vehicleTypes}
//                                 onChange={(e) => {
//                                     handleVehicleTypeChange(e.value);
//                                     setNewVehicle({ ...newVehicle, vehicleType: e.value });
//                                 }}
//                                 placeholder="Select vehicle type"
//                                 style={{ width: '100%' }}
//                             />
//                         </div>

//                         {/* Truck Number Field */}
//                         <div className="flex flex-column" style={{ flex: 1, padding: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
//                             <label htmlFor="gvmAxelWeight" className="font-semibold">Truck Number</label>
//                             <InputText
//                                 id="gvmAxelWeight"
//                                 value={newVehicle.gvmAxelWeight}
//                                 onChange={(e) => setNewVehicle({ ...newVehicle, gvmAxelWeight: e.target.value })}
//                                 placeholder="T000XXX"
//                                 style={{ width: '100%', height: '80%' }}
//                             />
//                         </div>
//                     </div>

//                     {tableValue.length > 0 && (
//                         <div className="card p-fluid" style={{ flex: 1, padding: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
//                             <DataTable
//                                 showGridlines
//                                 value={[...tableValue, totalRow]} // Add total row to the data table
//                                 editMode="row"
//                                 dataKey="id"
//                                 onRowEditComplete={onRowEditComplete}
//                                 tableStyle={{ minWidth: '50rem' }}
//                             >
//                                 <Column
//                                     headerStyle={{ textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', width: '100%' }}
//                                     bodyStyle={{ textAlign: 'center' }}
//                                     field="inventoryStatus"
//                                     header="Axel Group"
//                                     body={statusBodyTemplate}
//                                     editor={(options) => statusEditor(options)}
//                                     style={{ width: '20%' }}
//                                 />
//                                 <Column
//                                     headerStyle={{ textAlign: 'center' }}
//                                     bodyStyle={{ textAlign: 'center' }}
//                                     field="name"
//                                     header="Axel Weight"
//                                     editor={(options) => textEditor(options)}
//                                     style={{ width: '20%' }}
//                                 />
//                                 <Column
//                                     headerStyle={{ textAlign: 'center' }}
//                                     bodyStyle={{ textAlign: 'center' }}
//                                     field="weightLimit"
//                                     header="Weight Limit"
//                                     editor={(options) => textEditor(options)}
//                                     style={{ width: '20%' }}
//                                 />
//                                 <Column
//                                     headerStyle={{ textAlign: 'center' }}
//                                     bodyStyle={{ textAlign: 'center' }}
//                                     header="Actions"
//                                     body={(rowData, { rowIndex }) => (
//                                         rowIndex === tableValue.length - 1 ? null : (
//                                             <Button icon="pi pi-pencil" className="p-button-text" />
//                                         )
//                                     )}
//                                     style={{ width: '20%' }}
//                                 />
//                             </DataTable>
//                         </div>
//                     )}

//                     <Button label="Save" icon="pi pi-check" onClick={handleAddVehicle} />
//                     <Button label="Cancel" icon="pi pi-times" onClick={() => setIsAdding(false)} className="p-button-secondary" />
//                 </div>
//             ) : (
//                 <>
//                     <DataTable
//                         value={vehicles}
//                         paginator
//                         rows={10}
//                         header={renderHeader()}
//                         filters={filters}
//                         globalFilterFields={['name', 'gvmAxelWeight']}
//                         loading={loading}
//                         emptyMessage="No vehicles found."
//                     >
//                         <Column field="name" header="Vehicle Name" sortable />
//                         <Column field="gvmAxelWeight" header="Axel Weight" sortable />
//                         <Column field="gvmWeightLimit" header="Weight Limit" sortable />
//                         <Column body={statusBodyTemplate} header="Status" sortable />
//                     </DataTable>

//                     {/* Total Row */}
//                     <div className="mt-4">
//                         <h5 className="font-bold">Total Axel Weight: {calculateTotals()} kg</h5>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }






// import React, { useState, useEffect } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Dropdown } from 'primereact/dropdown';
// import AuthService from 'services/Api';

// export default function Vehicles() {
//     const [vehicles, setVehicles] = useState([]);
//     const [vehicleTypes, setVehicleTypes] = useState([]);
//     const [filters, setFilters] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [globalFilterValue, setGlobalFilterValue] = useState('');
//     const [isAdding, setIsAdding] = useState(false);
//     const [tableValue, setTableValue] = useState([]);
//     const [newVehicle, setNewVehicle] = useState({
//         vehicleType: '',
//         gvmAxelWeight: '',
//         gvmWeightLimit: '',
//         status: '',
//         gvnOverload: '',
//         gvmAllowance: ''
//     });
//     const [gvmTotals, setGvmTotals] = useState({
//         totalAxelWeight: 0,
//         totalWeightLimit: 0,
//     });

//     useEffect(() => {
//         fetchVehicles();
//         fetchVehicleTypes();
//         initFilters();
//     }, []);

//     const fetchVehicles = async () => {
//         setLoading(true);
//         try {
//             const response = await AuthService.getVehicle();
//             // setVehicles(response.data.results);
//         } catch (error) {
//             console.error('Failed to fetch vehicles:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchVehicleTypes = async () => {
//         try {
//             const response = await AuthService.getVehicleType();
//             const types = response.data.results.map(type => ({
//                 label: type.type,
//                 value: type.id
//             }));
//             setVehicleTypes(types);
//         } catch (error) {
//             console.error('Failed to fetch vehicle types:', error);
//         }
//     };

//     const initFilters = () => {
//         setFilters({
//             global: { value: null, matchMode: 'contains' },
//         });
//         setGlobalFilterValue('');
//     };

//     const renderHeader = () => {
//         return (
//             <div className="flex justify-content-between">
//                 <InputText
//                     value={globalFilterValue}
//                     onChange={onGlobalFilterChange}
//                     placeholder="Keyword Search"
//                 />
//                 <Button type="button" icon="pi pi-plus" label="Add" outlined onClick={() => setIsAdding(true)} />
//             </div>
//         );
//     };

//     const onGlobalFilterChange = (e) => {
//         const value = e.target.value;
//         let _filters = { ...filters };
//         _filters['global'].value = value;

//         setFilters(_filters);
//         setGlobalFilterValue(value);
//     };

//     const handleAddVehicle = async () => {
//         try {
//             await AuthService.setVehicle(newVehicle);
//             setNewVehicle({
//                 vehicleType: '',
//                 gvmAxelWeight: '',
//                 gvmWeightLimit: '',
//                 status: '',
//                 gvnOverload: '',
//                 gvmAllowance: ''
//             });
//             fetchVehicles();
//             setIsAdding(false);
//         } catch (error) {
//             console.error('Failed to add vehicle:', error);
//         }
//     };

//     const handleVehicleTypeChange = (value) => {
//         setTableValue([]);
//         AuthService.getAxelsByVehicleId(value).then((response) => {
//             const data = response.data.results;
//             setTableValue(data);
//             updateGvmTotals(data); // Calculate totals for the initial data
//         });
//     };

//     const textEditor = (options) => {
//         return <InputText type="text" value={options.value} onChange={(e) => {
//             options.editorCallback(e.target.value);
//             updateGvmTotals(tableValue); // Update totals whenever an edit occurs
//         }} />;
//     };

//     const onRowEditComplete = (e) => {
//         const _tableValue = [...tableValue];
//         const { newData, index } = e;
    
//         // Only update axelWeight for the edited row
//         if (newData.axelWeight !== undefined) {
//             _tableValue[index] = {
//                 ..._tableValue[index],
//                 axelWeight: newData.axelWeight,
//                 status: parseFloat(newData.axelWeight) > parseFloat(_tableValue[index].weightLimit) ? 'Overload' : 'Not Overload'
//             };
    
//             // Set the updated table value
//             setTableValue(_tableValue);
    
//             // Recalculate the totals for GVM without modifying weight limits
//             updateGvmTotals(_tableValue);
//         }
//     };
    

//     const updateGvmTotals = (data) => {
//         const gvmRow = data.find(row => row.groupName === "GVM");
    
//         if (gvmRow) {
//             // Calculate total axel weight
//             const totalAxelWeight = data.reduce((acc, curr) => acc + (parseFloat(curr.axelWeight) || 0), 0);
            
//             // Here, you can decide how to display total values (in state or elsewhere)
//             setGvmTotals({
//                 totalAxelWeight: totalAxelWeight,
//                 totalWeightLimit: gvmRow.weightLimit,  // or calculate this if needed
//             });
    
//             // Optionally update GVM row values for display
//             // gvmRow.axelWeight = totalAxelWeight; // Uncomment if needed for display only
//             // gvmRow.weightLimit = gvmRow.weightLimit; // This should not change
//         }
//     };
    

//     return (
//         <div className="card">
//             {isAdding ? (
//                 <div className="card shadow-2 p-4">
//                     <h2 className="text-2xl font-bold mb-3" style={{ color: '#51baff' }}>Add New Vehicle</h2>

//                     <div className="flex flex-wrap gap-4 mb-3">
//                         <div className="flex flex-column" style={{ flex: 1 }}>
//                             <label htmlFor="vehicleType" className="font-semibold">Vehicle Type</label>
//                             <Dropdown
//                                 id="vehicleType"
//                                 value={newVehicle.vehicleType}
//                                 options={vehicleTypes}
//                                 onChange={(e) => handleVehicleTypeChange(e.value)}
//                                 placeholder="Select vehicle type"
//                                 style={{ width: '100%' }}
//                             />
//                         </div>

//                         <div className="flex flex-column" style={{ flex: 1 }}>
//                             <label htmlFor="gvmAxelWeight" className="font-semibold">Axel Weight</label>
//                             <InputText
//                                 id="gvmAxelWeight"
//                                 value={newVehicle.gvmAxelWeight}
//                                 onChange={(e) => {
//                                     const value = e.target.value;
//                                     setNewVehicle({ ...newVehicle, gvmAxelWeight: value });
//                                 }}
//                                 placeholder="Enter axel weight"
//                                 style={{ width: '100%' }}
//                             />
//                         </div>
//                     </div>

//                     {tableValue.length > 0 && (
//                         <DataTable showGridlines value={tableValue} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete}>
//                             <Column field="groupName" header="Axel Group" style={{ width: '20%' }} />
//                             <Column field="axelWeight" header="Axel Weight" editor={textEditor} style={{ width: '20%' }} />
//                             <Column field="weightLimit" header="Weight Limit" style={{ width: '20%' }} />
//                             <Column field="status" header="Status" style={{ width: '20%' }} />
//                             <Column rowEditor header="Edit" style={{ width: '10%' }} />
//                         </DataTable>
//                     )}

//                     {/* Display GVM Totals */}
//                     <div className="mt-4">
//                         <h3>Total Axel Weight: {gvmTotals.totalAxelWeight}</h3>
//                         <h3>Total Weight Limit: {gvmTotals.totalWeightLimit}</h3>
//                     </div>

//                     <div className="mt-4">
//                         <Button label="Submit" className="mr-2" onClick={handleAddVehicle} />
//                         <Button label="Cancel" className="p-button-secondary" onClick={() => setIsAdding(false)} />
//                     </div>
//                 </div>
//             ) : (
//                 <div>
//                     <h1 style={{ color: '#51baff' }}>Vehicles</h1>
//                     <div className="card shadow-2">
//                         <DataTable value={vehicles} paginator rows={10} dataKey="id" filters={filters} loading={loading} globalFilterFields={['name', 'code', 'inventoryStatus']} header={renderHeader} emptyMessage="No vehicles found.">
//                             <Column field="name" header="Name" style={{ width: '25%' }} />
//                             <Column field="code" header="Code" style={{ width: '25%' }} />
//                             <Column field="inventoryStatus" header="Status" style={{ width: '25%' }} />
//                             <Column field="action" header="Action" style={{ width: '25%' }} />
//                         </DataTable>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
