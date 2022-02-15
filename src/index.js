import './styles.scss';
import "core-js/stable";
import "regenerator-runtime/runtime";
import background from '../public/res/homeflow.jpg';

const page = document.querySelector('.page');
const modal = document.querySelector('.modal');
const searchbarButton = document.querySelector('#searchbar-search');
const searchbarLocation = document.querySelector('#searchbar-location');
const searchbarPrice = document.querySelector('#searchbar-price');
const searchbarPriceNumber = document.querySelector('#searchbar-price-number');
const searchbarStatus = document.querySelector('#searchbar-status');
const modalCont = document.querySelector('#modal-cont');
const modalExit = document.querySelector('#modal-exit')
const searchbarFilters = [searchbarPrice, searchbarStatus];
//used for modal element; if using react, would use context state with routing to new page instead of modal
let allData = [];

//render results
const renderPageData = data => {
    page.innerHTML = '';

    data.length > 0 ?
    data.forEach((curr, index) => page.insertAdjacentHTML('beforeend', 
        `
            <div 
                class='col result' 
                style='background-image: linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url(${
                    curr.photos.length > 0 ?
                    `http://mr1.homeflow.co.uk/${curr.photos[0]}` :
                    background
                })'
                id=${index}
            >
                <h1>${curr.bedrooms} bedroom ${curr.property_type}</h1>
                <h2>'${curr.status}'</h2>
                <h2>Valued at £${curr.price_value.toLocaleString()}</h2>
                <h3>${curr.town ? curr.town : '(N/A)'}, ${curr.postcode}</h3>
            </div>
        `
    )) :
    page.insertAdjacentHTML('beforeend', 
        `
            <div class='noData'>
                <em><h1>No property data found...</h1></em>
            </div>
        `
    );
}

//render modal data
const renderModalData = idIndex => {
    modalCont.innerHTML='';

    const modalData = allData[Number(idIndex)];
    const{ bedrooms, property_type, status, price_value, town, postcode, contact_telephone, short_description, links } = modalData;

    modalCont.insertAdjacentHTML('afterbegin',
        `
            <h1>${bedrooms} bedroom ${property_type}</h1>
            <h2>'${status}'</h2>
            <h2>Valued at £${price_value.toLocaleString()}</h2>
            <h3>${town ? town : '(N/A)'}, ${postcode}</h3>
            <h3>Please call ${contact_telephone} if interested</h3>
            <p>${short_description}</p>
            <a href='${links.length > 0 ? links[0].url : 'https://www.homeflow.co.uk/'}'>View details</a>
        `
    );
}

//fetch api data
const fetchData = async (location, filterArray = false) => {
    try {
        let response;
        let renderData;

        if(location){
            response = await fetch(`/api/properties?location=${location}`);
        } else {
            throw new Error('Empty location name');
        }

        const data = await response.json();
        const dataArray = data.result.properties.elements;

        //filter the 'dataArray' based on filters if any
        if(filterArray && filterArray.length > 0){
            renderData = dataArray.filter(curr => 
                filterArray.every(filter => {
                    if(filter.id === 'searchbar-price' && Number(filter.value) >= curr.price_value){
                        return true;
                    } else if (filter.id === 'searchbar-status' && filter.value === curr.status) {
                        return true;
                    } else {
                        return false;
                    }
                })
            )
        } else {
            renderData = dataArray;
        }

        allData = renderData;
        renderPageData(renderData);  
    } catch(error){
        alert(`Error: ${error.message}`);
    }
}

//page delegation for all results; too performance intensive to add an event listener to each result, so only need to add to parent
page.addEventListener('click', e => {
    if(e.target.classList.contains('result') || e.target.closest('.result')){

        e.target.classList.contains('result') ? 
        renderModalData(e.target.id) :
        renderModalData(e.target.closest('.result').id);

        modal.classList.remove('modal__hidden');
    } 
});

//update the 'searchbarPrice' whenever range input is changed
searchbarPrice.addEventListener('input', () => searchbarPriceNumber.textContent = `£${Number(searchbarPrice.value).toLocaleString()}`);

//'searchbarButton' on click; only parse the non-empty input values as an array; doing this methodology incase need more filters in the future in 'searchbarFilters'
searchbarButton.addEventListener('click', () => {
    const filters = searchbarFilters.map(curr => 
        ({
            id: curr.id, 
            value: Number(curr.value) === 0 ? Number(curr.value) : curr.value 
        }) 
    );
    const truthyFilters = filters.filter(curr => curr.value);
    fetchData(searchbarLocation.value, truthyFilters);
});

//'modalExit' on click; to exit modal
modalExit.addEventListener('click', () => modal.classList.add('modal__hidden'));

//fetch on initial page render
fetchData('london');