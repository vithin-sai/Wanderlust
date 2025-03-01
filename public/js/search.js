function searchListings() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length > 0) {
        const filteredResults = allListings.filter(listing => {
            return (
                listing.location.toLowerCase().includes(query) ||
                listing.country.toLowerCase().includes(query)
            );
        });

        if (filteredResults.length > 0) {
            resultsContainer.innerHTML = filteredResults.map(listing => {
                return `
                    <a href="/listings/${listing._id}" class="listing-link">
                    <div class="card col listing-card">
                        <img src="${listing.image.url}" class="card-img-top" alt="image" style="height:20rem"/>
                        <div class="card-img-overlay"></div>
                        <div class="card-body">
                            <p class="card-text">
                                <b>${listing.title}</b> <br />
                                &#8377;${ listing.price ? listing.price.toLocaleString("en-IN") : "Price not available" } /night
                                <i class="tax-info"> &nbsp; &nbsp; +18 GST</i>
                            </p>         
                        </div>
                    </div>
                    </a>
                `;
            }).join('');
            resultsContainer.style.display = 'flex';
        } else {
            resultsContainer.innerHTML = '<div>No results found</div>';
            resultsContainer.style.display = 'flex';
        }
    } else {
        resultsContainer.style.display = 'none';
    }
}
