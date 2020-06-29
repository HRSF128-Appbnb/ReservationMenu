import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Moment from 'moment';

import styles from './css/index.css';
import Header from './components/Header';
import Calendar from './components/Calendar';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      price: 0,
      rating: 0,
      reviewCount: 0,
      capacity: 0,
      calendar: {},
      startDate: '',
      endDate: '',
      totalPrice: 0,
      stayCal: [],
      stayDuration: 0,
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
      guestCountMultiplier: 1,
    };
    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.handleGuestChange = this.handleGuestChange.bind(this);
  }

  componentDidMount() {
    this.getAll();
  }

  getAll() {
    const setData = this.setData.bind(this);
    // console.log('here is host',document.defaultView.location.host)
    axios.get('/10')
      .then((res) => {
        console.log('good get ', res.data['0'], res.data['1']);
        setData(res.data['0'], res.data['1']);
      })
      .catch((err) => { console.log('error in get ', err); });
  }

  setData(data, cal) {
    this.setState({
      price: cal['0']['1'].cost,
      rating: data.reviewAverage,
      reviewCount: data.reviewCount,
      capacity: data.guestCapacity,
      calendar: cal,
    });
  }

  handleStartChange(date) {
    const { calendar } = this.state;
    let { price } = this.state;
    let month, day;
    if (date !== '') {
      month = parseInt(date.slice(0, 2)) - 1;
      day = parseInt(date.slice(3, 5));
      console.log('in start change', calendar[month][day])
      price = calendar[month][day]['cost'];
    }
    this.setState({
      startDate: date,
      price: price,
    })
  }

  handleEndChange(date) {
    const { calendar, startDate } = this.state;
    let { totalPrice, stayDuration, price, stayCal } = this.state;
    let month, day, startMonth, startDay;
    if (date !== '') {
      totalPrice = 0;
      const startMoment = Moment(startDate, "MM/DD/YYYY");
      const endMoment = Moment(date, "MM/DD/YYYY").add(1, 'days');
      let currMonth, currDate;
      while (startMoment.isBefore(endMoment)) {
        currMonth = startMoment.month();
        currDate = startMoment.date();
        totalPrice += calendar[currMonth][currDate]['cost'];
        stayDuration += 1;
        stayCal.push([startMoment, calendar[currMonth][currDate]['cost']]);
        startMoment.add(1, 'days');
      }
      price = parseInt(totalPrice / stayDuration);
    } else if (date === '') {
      price = calendar['0']['1'].cost;
      stayDuration = 0;
      stayCal = [];
    }
    console.log(stayCal)
    this.setState({
      price: price,
      endDate: date,
      totalPrice: totalPrice,
      stayDuration: stayDuration,
      stayCal: stayCal,
    })
  }

  handleGuestChange(type, inc) {
    const { adultCount, childCount, infantCount, guestCountMultiplier } = this.state;
    const totalCount = adultCount + childCount;
    if (type === 'adult') {
      if (inc === 1) {
        this.setState({
          adultCount: adultCount + 1,
          guestCountMultiplier: guestCountMultiplier * 1.05,
        });
      } else {
        this.setState({
          adultCount: adultCount - 1,
          guestCountMultiplier: guestCountMultiplier / 1.05,
        });
      }
    } else if (type === 'child') {
      if (inc === 1) {
        this.setState({
          childCount: childCount + 1,
          guestCountMultiplier: guestCountMultiplier * 1.05,
        });
      } else {
        this.setState({
          childCount: childCount - 1,
          guestCountMultiplier: guestCountMultiplier / 1.05,
        });
      }
    } else if (type === 'infant') {
      if (inc === 1) {
        this.setState({
          infantCount: infantCount + 1,
        });
      } else {
        this.setState({
          infantCount: infantCount - 1,
        });
      }
    }
  }

  renderAvailButton() {
    const { startDate, endDate } = this.state;
    if (startDate && endDate) {
      return <button type="submit" className={styles.availButton}>Reserve</button>
    }
    return <button type="submit" className={styles.availButton}>Check availability</button>
  }

  renderCosts() {
    const { endDate, totalPrice, stayDuration, price, guestCountMultiplier } = this.state;
    const finalPrice = parseInt(price * guestCountMultiplier);
    const subCost = finalPrice * stayDuration;
    const cleaningFee = parseInt(subCost / 8.2) + 8;
    const serviceFee = parseInt(subCost / 10.5) + 5;
    const nightText = stayDuration === 1 ? ' night' : ' nights';
    const totalCost = subCost + cleaningFee + serviceFee;
    if (endDate) {
      return (
        <>
          <div className={styles.costDrop}>
            <div>You won't be charged yet</div>
          </div>
            <div className={styles.costBox}>
              <div className={styles.costLeft}>{'$'}{finalPrice}{' x '}{stayDuration}{nightText}</div><div className={styles.costRight}>{'$'}{subCost}</div>
            </div>
            <div className={styles.costBox}>
              <div className={styles.costLeft}>Cleaning fee</div><div className={styles.costRight}>{'$'}{cleaningFee}</div>
            </div>
            <div className={styles.costBoxLast}>
              <div className={styles.costLeft}>Service Fee</div><div className={styles.costRight}>{'$'}{serviceFee}</div>
            </div>
          <div className={styles.costTotal}>
            <div className={styles.costTotalLeft}>Total</div><div className={styles.costTotalRight}>{'$'}{totalCost}</div>
          </div>
        </>
      )
    }
    return null;

  }

  render() {
    const {
      reviewCount, capacity, calendar, startDate, endDate, adultCount, childCount, infantCount, guestCountMultiplier,
    } = this.state;
    let { price } = this.state;
    price = parseInt(price * guestCountMultiplier);
    let { rating } = this.state;
    rating = rating.toFixed(2);
    return (
      <>
        <div className={styles.root}>
          <Header price={price} rating={rating} reviewCount={reviewCount} />
          <br />
          <Calendar capacity={capacity} calendar={calendar} handleStartChange={this.handleStartChange} handleEndChange={this.handleEndChange} startDate={startDate} endDate={endDate} adultCount={adultCount} childCount={childCount} infantCount={infantCount} handleGuestChange={this.handleGuestChange} />
          {this.renderAvailButton()}
          {this.renderCosts()}
        </div>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('resMenu'));
