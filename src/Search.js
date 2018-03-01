import React from 'react';
import axios from 'axios';
import Moment from 'react-moment';


class SearchForm extends React.Component {
  render() {
      const suggestion_aim = (this.props.from_suggestions.length > 0 ? 'from' : 'to');
      const suggestions = (this.props.from_suggestions.length > 0 ? this.props.from_suggestions : this.props.to_suggestions);
      const renderSuggestions = suggestions.map((result, index) => {
        return (
          <div
            data-key={result.id}
            data-source={suggestion_aim}
            data-code={result.code}
            onClick={this.props.handleSuggestionSubmit}
          >
            {result.code} - {result.name}
          </div>
          )
      });
    return (
      <form onSubmit={this.props.handleSubmit}>
        <input type="text" name="from" value={this.props.from} placeholder="From" onFocus={this.props.handleOnBlur} onChange={this.props.handleDestinationChange} />
        <input type="text" name="to" value={this.props.to} placeholder="To" onFocus={this.props.handleOnBlur} onChange={this.props.handleDestinationChange} />
        <input type="text" name="date" value={this.props.date} placeholder="Depature date DD/MM/YYYY" onChange={this.props.handleChange} />
        <input type="submit" value="Submit" />
          {renderSuggestions}
      </form>
    );
  }
}


class SearchResult extends React.Component {
  render() {
    return (
      <li> <Moment unix>{this.props.dDate}</Moment> - <Moment unix>{this.props.aDate}</Moment> - {this.props.from} -> {this.props.to} for {this.props.price}&euro; </li>
    );
  }
}



class SearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {currentPage: this.props.currentPage, itemsPerPage: this.props.itemsPerPage}
    this.handlePaging = this.handlePaging.bind(this);
  }

  handlePaging(event) {
    this.setState({currentPage: event.target.id})
  }

  renderLoadingInfo() {
    return (
      <div>
        Loading
      </div>
      );
  }

  render() {
      const indexOfLastItem = this.state.currentPage * this.state.itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - this.state.itemsPerPage;
      const currentResults = this.props.results.slice(indexOfFirstItem, indexOfLastItem);

      const renderResults = currentResults.map((result, index) => {
                    return <SearchResult 
                      from={result.flyFrom}
                      to={result.flyTo}
                      price={result.price}
                      dDate={result.dTimeUTC}
                      aDate={result.aTimeUTC}/>;
      });

      // Logic for displaying page numbers
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(this.props.results.length / this.state.itemsPerPage); i++) {
        pageNumbers.push(i);
      }

      const renderPageNumbers = pageNumbers.map(number => {
        const currentPage = this.state.currentPage
        return (
          <div
            id={number}
            onClick={this.handlePaging}
            style={{display: 'inline-block', width: '20px', backgroundColor: (currentPage === number && 'red' : 'white')}}
          >
            {number}
          </div>
        );
      });

      return (
        <div>
          <ul>
            {this.props.loading ? this.renderLoadingInfo(): renderResults}
          </ul>
          <div style={{display: 'block', margin: '0 auto'}}>
            {renderPageNumbers}
          </div>
        </div>
      );
  }
}



class SearchApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {from: '', to: '', date: '', results: [], from_suggestions: [], to_suggestions: [], loading: false};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDestinationChange = this.handleDestinationChange.bind(this);
    this.handleSuggestionSubmit = this.handleSuggestionSubmit.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  handleOnBlur(event) {
    this.setState({[event.target.name + '_suggestions']: []});
  }

  handleSuggestionSubmit(event) {
    this.setState({[event.target.dataset.source]: event.target.dataset.code, [event.target.dataset.source + '_suggestions']: []});
  }

  handleDestinationChange(event) {
    event.preventDefault();
    const state_name = event.target.name + '_suggestions';
    const current_value = event.target.value;
    this.setState({[event.target.name]: current_value});
    if (current_value.length > 1) {
      this.setState({loading: true}, () => {
        axios.get('https://api.skypicker.com/locations/?term='+ current_value +'&v=2&locale=en-US')
          .then(res => {
            // Transform the raw data by extracting the nested posts
            const results = res.data.locations;
            // Update state to trigger a re-render.
            // Clear any errors, and turn off the loading indiciator.
            this.setState({
              [state_name]: results,
              loading: false,
            });
          })
          .catch(err => {
            // Something went wrong. Save the error in state and re-render.
            this.setState({
              loading: false,
              error: err
            });
          });
      });
    }
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({loading: true}, () => {
      axios.get('https://api.skypicker.com/flights?flyFrom=' + this.state.from + '&to=' + this.state.to + '&dateFrom='+this.state.date+'&dateTo='+this.state.date)
      .then(res => {
        // Transform the raw data by extracting the nested posts
        const results = res.data.data;
        // Update state to trigger a re-render.
        // Clear any errors, and turn off the loading indiciator.
        this.setState({
          loading: false,
          results: results
        });
      })
      .catch(err => {
        // Something went wrong. Save the error in state and re-render.
        this.setState({
          loading: false,
          error: err
        });
      });
      // event.preventDefault();
    });
  }

  render() {
    return (
      <div>
      <SearchForm 
        from={this.state.from}
        from_suggestions={this.state.from_suggestions}
        to={this.state.to}
        to_suggestions={this.state.to_suggestions}
        date={this.state.date}
        handleChange={this.handleChange}
        handleDestinationChange={this.handleDestinationChange}
        handleSubmit={this.handleSubmit}
        handleSuggestionSubmit={this.handleSuggestionSubmit}
        handleOnBlur={this.handleOnBlur}
      />
      <SearchResults
        loading={this.state.loading}
        results={this.state.results}
        currentPage={1}
        itemsPerPage={5}
      />
      </div>
    );
  }

}

export default SearchApp;
