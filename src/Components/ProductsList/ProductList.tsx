import { ChangeEvent, useEffect, useState } from "react";
import { Select, Table } from "antd";
import { IProduct, ISearchParams } from "../../inteface/interface";
import { productTableColumn } from "../../data/productsTable.data";
import { EAction } from "../../enum/EAction";
import { axiosApiClient } from "../../api/axiosApiClient";
import { mapFieldsArray, mapStringArrayToOptions } from "../../services/mappers";
import "./ProductList.css"

export const ProductList = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [brandFileds, setBrandFileds] = useState<any[]>([])
    const [filters, setFilters] = useState<ISearchParams>({
        "name": "",
        "brand": "",
        "price": 0
    });
    const [priceInputValue, setPriceInputValue] = useState<string>('');
    const [nameInputValue, setNameInputValue] = useState<string>('')

    const onPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPriceInputValue(e.target.value);
    }

    const onProductChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNameInputValue(e.target.value)
    }

    useEffect(()=>{
        fetchData(currentPage)
    }, [currentPage, setFilters]);

    useEffect(() => {
        const getFields = async () => {
            const brandFields = await axiosApiClient.getFields()
            const uniqueBrandFields = mapFieldsArray(brandFields)
            const optionsHandler = mapStringArrayToOptions(uniqueBrandFields as any)
            setBrandFileds(optionsHandler)
        }

        getFields()
    }, [])

    const fetchData = async (page: number) => {
        const offset = (page - 1) * 50;
        try {
            setLoading(true);
        const queryParams = {
            offset,
            limit: 50,
            ...filters
        };
        const action = (filters.brand || filters.name || filters.price) ? EAction.filter : EAction.get_ids;

        const idsResponse = await axiosApiClient.getProducts(action, queryParams);
        const allIds = idsResponse.result;
        const uniqueIds = Array.from(new Set(allIds));
        const itemsResponse = await axiosApiClient.getProducts(EAction.get_items, { ids: uniqueIds });
        const uniqueProducts = itemsResponse.result.reduce((acc: IProduct[], curr: IProduct) => {
            if (!acc.some((product) => product.id === curr.id)) {
                acc.push(curr);
            }
            return acc;
        }, []);
        setProducts(uniqueProducts);
        } catch (error) {
            console.error(error);
            fetchData(page); 
        } finally {
            setLoading(false);
        }
    };

    const filterProductsByBrand = async(newBrand: string) => {
        try {
            setFilters((prevState) =>  {return {...prevState, brand: newBrand}});
            const filteredProducts = await axiosApiClient.getProductsByBrandFilter(newBrand);
            const itemsResponse = await axiosApiClient.getProducts(EAction.get_items, { ids: filteredProducts.result });
            if (itemsResponse.result) {
                setProducts(itemsResponse.result)
            }
        
        } catch(e){
            console.error(e)
        }
    
    }

    const filterProductByPrice = async(newPrice: number) =>{
        try {
            setFilters((prevState) =>  ({...prevState, price: newPrice}));
            const filteredProducts = await axiosApiClient.getProductsByPriceFilter(newPrice);
            const itemsResponse = await axiosApiClient.getProducts(EAction.get_items, { ids: filteredProducts.result });
            if (itemsResponse.result) {
                setProducts(itemsResponse.result)
            }
            
        } catch(e){
            console.error(e)
        }
    }

    const handlePriceFilterSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const price = parseFloat(priceInputValue);
            await filterProductByPrice(price);
        } catch (error) {
            console.error(error);
            setLoading(false);
        } finally {
            setLoading(false);
            setPriceInputValue("")
        }
    }

    const filterProductsByName = async (newProduct: string) => {
        try {
            setFilters((prevState)=> ({...prevState, product: newProduct}));
            const filteredProducts = await axiosApiClient.getProductByProductFilter(newProduct);
            const itemsResponse = await axiosApiClient.getProducts(EAction.get_items, { ids: filteredProducts.result });
            if (itemsResponse.result) {
                setProducts(itemsResponse.result)
            }
        } catch(e) {
            console.error(e)
        }
    }

    const handleNameFilterSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const productName = nameInputValue;
            await filterProductsByName(productName);
        } catch(e) {
            console.error(e)
        } finally {
            setLoading(false);
            setNameInputValue("")
        }
    }

return (
    <div>
        <form>
            <Select    
                style={{
                    width: "200px"
                }}
                options={brandFileds}
                value={filters.brand}
                onChange={(value: string) => {
                    filterProductsByBrand(value);
                }}
            />
            <div className="inputForm">
                <input
                    name="price"
                    type="number" 
                    value={priceInputValue} 
                    onChange={onPriceChange}
                    placeholder="Price"
                />
                <button type="submit" onClick={handlePriceFilterSubmit}>Submit Price</button>
            </div>
            <div className="inputForm">
                <input
                    name="name"
                    value={nameInputValue}
                    onChange={onProductChange}
                    placeholder="Product Name"
                />
                <button type="submit" onClick={handleNameFilterSubmit}>Submit Product</button>
            </div>
        </form>
        <Table 
            columns={productTableColumn} 
            dataSource={products}   
            pagination={{
                current: currentPage,
                pageSize:50, 
                total: 8000
            }}
            loading={loading}
            onChange={(e) => e?.current && setCurrentPage(e.current)}
            rowKey={(record: IProduct) => record.id}
        />
    </div>
);
}