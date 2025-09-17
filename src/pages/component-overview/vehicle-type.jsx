import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Autocomplete, TextField, Chip, Avatar } from '@mui/material';

import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import AuthService from 'services/AuthService'; // Assuming this is your API service

export default function VehicleType() {

    const toast = useRef(null);

    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newType, setNewType] = useState('');
    //const [weightLimit, setWeightLimit] = useState('');
    const [selectedAxelGroup, setSelectedAxelGroup] = useState([]); // Array for selected axel groups
    const [newPrice, setNewPrice] = useState('');
    const [axelGroupOptions, setAxelGroupOptions] = useState([]); // State for fetched axel groups
    const [selectedOptions, setSelectedOptions] = useState([]);


    const columns = [
        { field: 'id', header: 'S/No' },
        { field: 'type', header: 'Name' },
        { field: 'axels', header: 'Axel' },
        { field: 'price', header: 'Pcice' },
        { field: 'action', header: 'Action' }
    ];


    // Fetch axel groups from API on component mount
    useEffect(() => {
        fetchAxelGroups();
        fetchVehicleTypes();
        initFilters();
    }, []);

    const fetchAxelGroups = async () => {
        try {
            const response = await AuthService.getAxelGroup();
            const axelGroups = response.data.results.map(group => ({
                label: group.groupName+' - '+group.description, // Assuming `groupName` is the name field from API response
                value: group.id
            }));
            setAxelGroupOptions(axelGroups);
        } catch (error) {
            console.error('Failed to fetch axel groups:', error);
        }
    };


    const fetchVehicleTypes = async () => {
        try {
            const response = await AuthService.getVehicleType();
            console.log('Response:', response.data.results);
            setVehicleTypes(response.data.results);
        } catch (error) {
            console.error('Failed to fetch vehicle types:', error);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

    const handleAddVehicleType = async () => {

        if(newType===''){
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No Vehicle Type', life: 2000 });
            return
        }

        let groups = selectedOptions.map(option => option.value)


        if(groups.length<2){
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid Axel Groups', life: 2000 });
            return
        }
        
        if(newPrice===''){
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No Weighting Price', life: 2000 });
            return
        }

        
        const newVehicleType = {
            type: newType,
            //weightLimit:weightLimit,
            price: Number(newPrice),
            axelGroup: groups
        };

        console.log(newVehicleType);

        try {
            await AuthService.setVehicleType(newVehicleType);
            // setVehicleTypes([...vehicleTypes, newVehicleType]);
            setNewType('');
            //setWeightLimit(0);
            setSelectedAxelGroup(null);
            setNewPrice('');
            setSelectedOptions([]);
            fetchVehicleTypes();
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to add vehicle type:', error);
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
            setVehicleTypes(vehicleTypes.filter(v => v.id !== rowData.id));
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

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };




    // const getAxelNames = (axelArray) => {

    //     return axelArray.map(axel => axel.groupName).join(', ');
    // };



    const getAxelNames = (axelArray) => {
        return axelArray.map(axel => axel.groupName).join(', ');
    };





    return (
        <div className="card">
            {isAdding ? (
                <div className="card shadow-2 p-4">
                    <h2 className="text-2xl font-bold mb-3">Add New Vehicle Type</h2>
                    <div className="flex flex-column mb-3">
                        <label htmlFor="type" className="font-semibold">Type</label>
                        <InputText
                            id="type"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            placeholder="Enter vehicle type"
                            style={{ width: '100%', height: '50px' }}
                        />
                    </div>

                    <div className="col-span-full">
                        <Autocomplete
                            fullWidth
                            multiple
                            id="tags-standard"
                            options={axelGroupOptions.filter((option) =>
                                !selectedOptions.some((selected) => selected.value === option.value)
                            )} // Exclude already selected options
                            getOptionLabel={(option) => option.label}
                            renderOption={(props, option) => (
                                <li {...props} className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-100">
                                    <div>
                                        <div className="text-sm font-semibold">{option.label}</div>
                                        <div className="text-xs text-gray-500">{option.description}</div>
                                    </div>
                                </li>
                            )}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => (
                                    <Chip
                                        key={index}
                                        label={option.label}
                                        {...getTagProps({ index })}
                                        className="m-1"
                                        onDelete={() => {
                                            // Handle the removal of selected options
                                            setSelectedOptions((prevSelected) =>
                                                prevSelected.filter((_, i) => i !== index)
                                            );
                                        }}
                                    />
                                ))
                            }
                            value={selectedOptions}
                            onChange={(event, newValue) => {
                                // Update selected options; keep unique values
                                const uniqueValues = newValue.filter((value) =>
                                    !selectedOptions.some((selected) => selected.value === value.value)
                                );

                                // Update the state with the unique values
                                setSelectedOptions((prevSelected) => [
                                    ...prevSelected,
                                    ...uniqueValues,
                                ]);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    placeholder="Select option..."
                                    className="w-full"
                                />
                            )}
                            className="w-full border border-gray-200 rounded-lg "
                        />
                    </div>




                    {/* <div className="flex flex-column mb-3 mt-3">
                        <label htmlFor="price" className="font-semibold">Weight Limit</label>
                        <InputText
                            id="weightLimit"
                            value={weightLimit}
                            onChange={(e) => setWeightLimit(e.target.value)}
                            placeholder="Enter Weight Limit"
                            type="number"
                            style={{ width: '100%', height: '50px' }}
                        />
                    </div> */}

                    <div className="flex flex-column mb-3 mt-3">
                        <label htmlFor="price" className="font-semibold">Weighting Price</label>
                        <InputText
                            id="price"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="Enter price"
                            type="number"
                            style={{ width: '100%', height: '50px' }}
                        />
                    </div>

                    <div className="flex justify-content-center">
                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            className="p-button-success mx-2"
                            onClick={handleAddVehicleType}
                        />
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-danger mx-2"
                            onClick={() => setIsAdding(false)}
                        />
                    </div>
                </div>
            ) : (
               



                <DataTable
                value={vehicleTypes}
                showGridlines
                paginator
                rows={10}
                loading={loading}
                dataKey="id"
                filters={filters}
                globalFilterFields={['type']}
                header={renderHeader()}
                emptyMessage="No vehicle types found."
                className="shadow-2"
                onFilter={(e) => setFilters(e.filters)}
            >
                {columns.map((col, i) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        body={
                            col.field === 'axels'
                                ? (rowData) => rowData.axels.map(axel => axel.groupName).join(', ')
                                : col.field === 'action'
                                ? actionBodyTemplate 
                                : null
                        }
                    />
                ))}
            </DataTable>
            


            )}


<Toast ref={toast} />

        </div>
    );
}
