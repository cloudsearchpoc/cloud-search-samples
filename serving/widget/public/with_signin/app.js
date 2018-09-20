/**
 * Load the cloud search widget & auth libraries. Runs after
 * the initial gapi bootstrap library is ready.
 */
function onLoad() {
  gapi.load('client:auth2:cloudsearch-widget', initializeApp)
}

/**
 * Initialize the app after loading the Google API client &
 * Cloud Search widget.
 */
function initializeApp() {
  var resultsContainer;

  // Load client ID & search app.
  fetch('/config.json').then(function(response) {
    return response.json();
  }).then(function(searchConfig) {
    // Set API version to v1.
    gapi.config.update('cloudsearch.config/apiVersion', 'v1');

    // Build the result container and bind to DOM elements.
    resultsContainer = new gapi.cloudsearch.widget.resultscontainer.Builder()
      .setSearchApplicationId(searchConfig.searchAppId)
      .setSearchResultsContainerElement(document.getElementById('search_results'))
      .setFacetResultsContainerElement(document.getElementById('facet_results'))
      .build();

    // Build the search box and bind to DOM elements.
    var searchBox = new gapi.cloudsearch.widget.searchbox.Builder()
      .setSearchApplicationId(searchConfig.searchAppId)
      .setInput(document.getElementById('search_input'))
      .setAnchor(document.getElementById('suggestions_anchor'))
      .setResultsContainer(resultsContainer)
      .build();
    return searchConfig;
  }).then(function(searchConfig) {
    // Init API/oauth client w/client ID.
    return gapi.auth2.init({
        'clientId': searchConfig.clientId,
        'scope': 'https://www.googleapis.com/auth/cloud_search.query'
    });
  }).then(function() {
    // Handle sign-in/sign-out.
    let auth = gapi.auth2.getAuthInstance();

    // Watch for sign in status changes to update the UI appropriately.
    let onSignInChanged = (isSignedIn) => {
      document.getElementById("app").hidden = !isSignedIn;
      document.getElementById("welcome").hidden = isSignedIn;
      if (resultsContainer) {
        resultsContainer.clear();
      }
    }
    auth.isSignedIn.listen(onSignInChanged);
    onSignInChanged(auth.isSignedIn.get()); // Trigger with current status.

    // Connect sign-in/sign-out buttons.
    document.getElementById("sign-in").onclick = (e) =>  auth.signIn();
    document.getElementById("sign-out").onclick = (e) => auth.signOut();
  });

}
