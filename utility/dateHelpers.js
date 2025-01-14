const moment = require( "moment" );

const getCurrentMonth = () => {
  const date = new Date();
  return date.getMonth() + 1;
};

const getPreviousAndNextMonth = () => {
  const month = getCurrentMonth();

  if ( month === 1 ) {
    return [12, 1, 2];
  }

  if ( month === 12 ) {
    return [11, 12, 1];
  }

  return [month - 1, month, month + 1];
};

const requiresParent = ( birthday ) => {
  const today = moment().format( "YYYY-MM-DD" );
  const thirteen = moment( today ).subtract( 13, "year" ).format( "YYYY-MM-DD" );
  if ( moment( birthday ).isAfter( thirteen ) ) {
    return true;
  }
  return false;
};

const seenBeforeSeekV2 = ( seenDate ) => {
  const apr5 = moment( "20190405" ).format( "YYYY-MM-DD" );
  if ( moment( seenDate ).isBefore( apr5 ) ) {
    return true;
  }
  return false;
};

const checkIfChallengeAvailable = ( date ) => {
  if ( date <= new Date() ) {
    return true;
  }
  return false;
};

export {
  seenBeforeSeekV2,
  getPreviousAndNextMonth,
  checkIfChallengeAvailable,
  requiresParent
};
