import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Header from '../Header'
import Filters from '../Filters'
import JobCard from '../JobCard'

import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const locationsList = [
  {
    label: 'Hyderabad',
    locationId: 'Hyderabad',
  },
  {
    label: 'Bangalore',
    locationId: 'Bangalore',
  },
  {
    label: 'Chennai',
    locationId: 'Chennai',
  },
  {
    label: 'Delhi',
    locationId: 'Delhi',
  },
  {
    label: 'Mumbai',
    locationId: 'Mumbai',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    apiStatus: apiStatusConstants.initial,
    employeeType: [],
    minimumSalary: 0,
    searchInput: '',
    selectedLocations: [],
  }

  componentDidMount() {
    this.getJobs()
  }

  getJobs = async () => {
    const {selectedLocations} = this.state
    console.log(`rendered Locations ${selectedLocations}`)
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const {employeeType, minimumSalary, searchInput} = this.state

    const employeeTypes = employeeType.join(',')

    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employeeTypes}&minimum_package=${minimumSalary}&search=${searchInput}`

    const jwtToken = Cookies.get('jwt_token')

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)

    if (response.ok === true) {
      const data = await response.json()
      const updatedJobsData = data.jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))

      let filteredData = updatedJobsData
      if (selectedLocations.length !== 0) {
        filteredData = updatedJobsData.filter(job => {
          let isLocationIncluded = false
          selectedLocations.forEach(location => {
            if (job.location === location) {
              isLocationIncluded = true
            }
            return isLocationIncluded
          })
          return isLocationIncluded
        })
      }
      this.setState({
        jobsList: filteredData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderJobsList = () => {
    const {jobsList} = this.state
    console.log(jobsList)
    const renderJobsList = jobsList.length > 0
    return renderJobsList ? (
      <div className="all-jobs-container">
        <ul className="jobs-list">
          {jobsList.map(job => (
            <JobCard jobData={job} key={job.id} />
          ))}
        </ul>
      </div>
    ) : (
      <div className="no-jobs-view">
        <img
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
          className="no-jobs-img"
        />
        <h1 className="no-jobs-heading">No Jobs Found</h1>
        <p className="no-jobs-description">
          We could not find any jobs. Try other filters.
        </p>
      </div>
    )
  }

  renderFailureView = () => (
    <div className="jobs-error-container">
      <img
        alt="failure view"
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        className="jobs-failure-image"
      />
      <h1 className="jobs-failure-heading">Oops! Something Went Wrong</h1>
      <p className="jobs-failure-description">
        We cannot seem to find the page you are looking for{' '}
      </p>
      <button
        type="button"
        data-testid="button"
        className="jobs-failure-button"
        onClick={this.getJobs}
      >
        Retry
      </button>
    </div>
  )

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderAllJobs = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobsList()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  changeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onEnterSearchInput = event => {
    if (event.key === 'Enter') {
      this.getJobs()
    }
  }

  changeSalary = salary => {
    this.setState({minimumSalary: salary}, this.getJobs)
  }

  changeEmployeeList = type => {
    this.setState(
      prevState => ({
        employeeType: [...prevState.employeeType, type],
      }),
      this.getJobs,
    )
  }

  addLocation = location => {
    console.log(location)
    const {selectedLocations} = this.state
    console.log('loaction added')
    if (selectedLocations.includes(location)) {
      const updatedLocations = selectedLocations.filter(loc => loc !== location)
      return this.setState({selectedLocations: updatedLocations}, this.getJobs)
    }
    return this.setState(
      {selectedLocations: [...selectedLocations, location]},
      this.getJobs,
    )
  }

  render() {
    const {searchInput} = this.state
    return (
      <>
        <Header />
        <div className="jobs-container">
          <div className="jobs-content">
            <Filters
              locationsList={locationsList}
              addLocation={this.addLocation}
              employmentTypesList={employmentTypesList}
              salaryRangesList={salaryRangesList}
              changeSearchInput={this.changeSearchInput}
              searchInput={searchInput}
              getJobs={this.getJobs}
              changeSalary={this.changeSalary}
              changeEmployeeList={this.changeEmployeeList}
            />
            <div className="search-input-jobsList-container">
              <div className="search-input-container">
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search"
                  onChange={this.changeSearchInput}
                  onKeyDown={this.onEnterSearchInput}
                />
                <button
                  type="button"
                  data-testid="searchButton"
                  className="search-button-container"
                  onClick={this.getJobs}
                >
                  <BsSearch className="search-icon-desktop" />
                </button>
              </div>
              {this.renderAllJobs()}
            </div>
          </div>
        </div>
      </>
    )
  }
}
export default Jobs
