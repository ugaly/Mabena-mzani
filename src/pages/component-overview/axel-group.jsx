import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import AuthService from 'services/AuthService';

export default function AxelGroup() {
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [allowed, setAllowed] = useState('');

    useEffect(() => {
        fetchAxelGroups();
        initFilters();
    }, []);

    const fetchAxelGroups = async () => {
        try {
            const response = await AuthService.getAxelGroup();
            console.log(response.data.results);
            setCustomers(response.data.results); // Assuming response.data contains the array of axel groups
        } catch (error) {
            console.error('Failed to fetch axel groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

    const handleAddCustomer = async () => {
        const newCustomer = {
            groupName: newName,
            description: newDescription,
            allowed: Number(allowed),
        };
        
        try {
            await AuthService.setAxelGroup(newCustomer).then(res => {
              // setCustomers([...customers, newCustomer]); // Add to local state
              console.log(res.data);
              setNewName('');
              setNewDescription('');
              setAllowed('');
              setIsAdding(false);
              fetchAxelGroups(); // Optionally refetch to ensure data is in sync
            })
        } catch (error) {
            console.error('Failed to add new axel group:', error);
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

    return (
        <div className="card">
            {isAdding ? (
                <div className="card shadow-2 p-4">
                    <h2 className="text-2xl font-bold mb-3">Add New Axel Group</h2>
                    <div className="flex flex-column mb-3">
                        <label htmlFor="name" className="font-semibold">Name</label>
                        <InputText 
                            id="name"
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            placeholder="Enter group name" 
                            style={{ width: '100%', height: '50px' }}
                        />
                    </div>
                    <div className="flex flex-column mb-3">
                        <label htmlFor="description" className="font-semibold">Description</label>
                        <textarea 
                            id="description"
                            rows={4}
                            value={newDescription} 
                            onChange={(e) => setNewDescription(e.target.value)} 
                            placeholder="Enter description" 
                            className="p-inputtext p-component w-full"
                        />
                    </div>
                    <div className="flex flex-column mb-3">
                        <label htmlFor="weightLimit" className="font-semibold">Allowed Weight</label>
                        <InputText 
                            id="allowed"
                            value={allowed} 
                            onChange={(e) => setAllowed(e.target.value)} 
                            placeholder="Enter allowed weight" 
                            type="number" 
                            style={{ width: '100%', height: '50px' }}
                        />
                    </div>
                    <div className="flex justify-content-center">
                        <Button 
                            label="Submit" 
                            icon="pi pi-check" 
                            className="p-button-success mx-2" 
                            onClick={handleAddCustomer} 
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
                    value={customers}
                    paginator
                    showGridlines
                    rows={10}
                    loading={loading}
                    dataKey="id"
                    filters={filters}
                    globalFilterFields={['name']}
                    header={renderHeader()}
                    emptyMessage="No customers found."
                    className="shadow-2"
                    onFilter={(e) => setFilters(e.filters)}
                    
                >
                    <Column field="id" header="S/N" />
                    <Column field="groupName" header="Name" filter filterPlaceholder="Search by name" />
                    <Column field="description" header="Description" />
                    <Column field="allowed" header="Allowed" />
                    <Column field="weightLimit" header="Weight Limit" />
                    <Column header="Action" body={actionBodyTemplate} />
                </DataTable>
            )}
        </div>
    );
}
