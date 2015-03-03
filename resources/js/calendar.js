/**
 * @author: Matthew Barsema <matthew.barsema@gmail.com>
 * @date: March 4, 2015
 *
 * Creates a timeline calendar.
 */
// {{{ constructor
/**
 * Calendar object
 *
 * @return none
 * @param: Array myEvents - an array of events 
 */
function Calendar( renderTo, myEvents, myTimeframe, mySettings ){

	if( typeof( myTimeframe ) === 'undefined' ){
		myTimeframe = {};
	}
	if( typeof( myTimeframe['startDateTime'] ) === 'undefined' ){
		var startDateTime = new Date();
		startDateTime.setHours(9);
		startDateTime.setMinutes(0);
		startDateTime.setSeconds(0);
		myTimeframe['startDateTime'] = startDateTime;
	}
	
	if( typeof( myTimeframe['endDateTime'] ) === 'undefined' ){
		var endDateTime = new Date();
		endDateTime.setHours(21);
		endDateTime.setMinutes(0);
		endDateTime.setSeconds(0);
		myTimeframe['endDateTime'] = endDateTime;
	}
	
	if( typeof(myTimeframe['ticks']) === 'undefined' ){
		myTimeframe['ticks'] = 24;
	}

	if(typeof( mySettings ) === 'undefined') mySettings = { };
	if(typeof(mySettings.event) === 'undefined') mySettings.event = {};
	
	if(typeof(mySettings.numberMinorTicks) === 'undefined') mySettings.numberMinorTicks = 2;
	if(typeof(mySettings.minimumWidth) === 'undefined') mySettings.minimumWidth = 120;
	if(typeof(mySettings.backgroundColor) === 'undefined') mySettings.backgroundColor = '#ececec';
	if(typeof(mySettings.paddingLeft) === 'undefined') mySettings.paddingLeft = 10;
	if(typeof(mySettings.paddingRight) === 'undefined') mySettings.paddingRight = 10;
	if(typeof(mySettings.width) === 'undefined') mySettings.width = 540;
	
	if(typeof(mySettings.event.paddingTop) === 'undefined') mySettings.event.paddingTop = 5;
	if(typeof(mySettings.event.paddingBottom) === 'undefined') mySettings.event.paddingBottom = 5;
	if(typeof(mySettings.event.paddingLeft) === 'undefined') mySettings.event.paddingLeft = 5;
	if(typeof(mySettings.event.paddingRight) === 'undefined') mySettings.event.paddingRight = 5;
	if(typeof(mySettings.event.borderLeftWidth) === 'undefined') mySettings.event.borderLeftWidth = 4;
	if(typeof(mySettings.event.borderRightWidth) === 'undefined') mySettings.event.borderRightWidth = 1;
	if(typeof(mySettings.event.borderTopWidth) === 'undefined') mySettings.event.borderTopWidth = 1;
	if(typeof(mySettings.event.borderBottomWidth) === 'undefined') mySettings.event.borderBottomWidth = 1;

	this.calendarElem = renderTo;
	var timeConfig = this.getTimes( myTimeframe );
	this.times = timeConfig.times;
	this.leftOffset = mySettings.paddingLeft;
	this.rightOffset = mySettings.paddingRight; 
	this.numberMinorTicks = mySettings.numberMinorTicks;
	this.minimumWidth = mySettings.minimumWidth;
	this.backgroundColor = mySettings.backgroundColor;
	
	this.heightOffset = mySettings.event.paddingTop + mySettings.event.paddingBottom;
	this.sideOffset = mySettings.event.paddingLeft + mySettings.event.paddingRight;
	this.leftBorderOffset = mySettings.event.borderLeftWidth;
	this.rightBorderOffset = mySettings.event.borderRightWidth;
	this.topBorderOffset = mySettings.event.borderTopWidth;
	this.bottomBorderOffset = mySettings.event.borderBottomWidth;
	
	this.borderHeightOffset = this.topBorderOffset + this.bottomBorderOffset;
	this.borderSideOffset = this.leftBorderOffset + this.rightBorderOffset;
	this.width = mySettings.width - (this.leftOffset + this.rightOffset);
	
	if( typeof( myEvents ) !== 'undefined' ){
		this.load( myEvents );
	}
}
// }}}
// {{{ load
/**
 * Load our events calendar
 *
 * @return none
 * @param events - An array containing events in the form {start: startMinsFromTime, end: endMinsFromTime}
 */
Calendar.prototype.load = function( events ){
	events.sort(function( left, right ){
		if( left['start'] < right['start'] ){
			return -1;
		}else if( left['start'] > right['start'] ){
			return 1;
		}
		if( left['end'] < right['end'] ){
			return -1;
		}
		if( left['end'] > right['end'] ){
			return 1;
		}
		if( left['title'] < right['title'] ){
			return -1;
		}
		if( left['title'] > right['title'] ){
			return 1;
		}
		if( left['location'] < right['location'] ){
			return -1;
		}
		if( left['location'] > right['location'] ){
			return 1;
		}
		return 0;
	});	
	this.events = events;
	this.render();
}
// }}}
// {{{ addMinutes
/**
 * Add minutes to our date
 * 
 * @return date - The date with minutes added to it.
 * @param date - A date time object to add minutes to
 * @param minutes - the number of minutes to add.
 */
Calendar.prototype.addMinutes = function( date, minutes ){
	return new Date( date.getTime() + minutes * 60 * 1000 );
}
// }}}
// {{{ getTimes
/**
 * Obtain information abou the time frame that was passed. 
 * 
 * @return - an object containing times and intervals
 * @param timeframe
 *
 * TODO: In the future this would make sense to generalize this rather than only being a timescale based around
 * 		 12 hours. It's possible that this would work with 24 hours with some data massaging. 
 *		 It is NOT possible with years, months and days at present 
 */
Calendar.prototype.getTimes = function( timeframe ){
	var timeDiff = timeframe.endDateTime - timeframe.startDateTime;
	
	//TODO: Calculate actual time differential
	timeDiff /= (1000 * 60); // Number of minutes required.
	var majorTicks = (timeframe.ticks / this.numberMinorTicks);
	var defaultHeight = timeDiff / majorTicks;
	var defaultInterval = timeDiff / timeframe.ticks;
	
	var times = [];
	var intervals = [];
	
	// Clone our start date to loop through our contents
	var currentDate = this.addMinutes( timeframe.startDateTime, 0 );
	var hours = currentDate.getHours();
	var mins = currentDate.getMinutes();
	var AMPM = 'AM';
	
	for( var i = 0; i <= timeframe.ticks; i++ ){
		hours = currentDate.getHours();
		mins = ( currentDate.getMinutes() < 10 ) ? "0" + currentDate.getMinutes() : currentDate.getMinutes();
		AMPM = 'AM';
		if( hours > 12 ){
			hours -= 12;
			AMPM = 'PM';
		}else if( hours == 0 ){
			hours = 12;
		}
		if( i % 2 == 0 ){
			times.push( hours + ':' + mins + ' ' + AMPM );
		}else{
			times.push( hours + ':' + mins );
		}
		intervals.push( Math.abs( Math.round((currentDate - timeframe.startDateTime) / (1000 * 60)) ) ); 
		currentDate = this.addMinutes(currentDate, defaultInterval);
	}
	
	return {
		'times': times,
		'intervalFromStart': intervals
	};
}
// }}}
// {{{ renderTime
/**
 * Renders the time
 * 
 * @return object - the DOM node that is to be rendered.
 * @param time - The string 
 * @param isMajor - A boolean describing if this is a major or minor tick
 */
Calendar.prototype.renderTime = function( time, isMajor ){
	var timeContainer = document.createElement('div');
	var type = (isMajor) ? 'major' : 'minor';
	var timeString = time;
	timeContainer.className = type + ' tick';
	
	var timeNode = document.createTextNode(timeString);
	if( isMajor ){
		var pieces = timeString.split(' ');
		timeNode = document.createTextNode(' ' +pieces[1]);
		
		var timeSpan = document.createElement('span');
		timeSpan.className = 'time';
		timeSpan.appendChild( document.createTextNode(pieces[0]) );
		timeContainer.appendChild( timeSpan );	
	}
	timeContainer.appendChild(timeNode);
	return timeContainer;
}
// }}}
// {{{ renderEvent
/**
 * Renders the event
 *
 * @return none
 * @param event - the event object to be rendered
 * @param container - the container that the event should be rendered to
 * @param render - a callback that actually renders the object
 */
Calendar.prototype.renderEvent = function( event, container, render ){
	var eventContainer = document.createElement('div');
	eventContainer.className = 'event';
	
	eventContainer.style.position = 'absolute';
	eventContainer.style.top = (event.start) + "px";
	eventContainer.style.height = (event.end - event.start - this.heightOffset - this.borderHeightOffset) + "px";
	if( typeof( event.left ) !== 'undefined' ) eventContainer.style.left = event.left + "px";
	if( typeof( event.width ) !== 'undefined') eventContainer.style.width = event.width + "px";
	
	var titleContainer = document.createElement('div');
	titleContainer.className = 'eventHeader';
	
	var locationContainer = document.createElement('div');
	locationContainer.className = 'eventLocation';
	
	var descriptionContainer = document.createElement('div'); 
	descriptionContainer.className = 'eventDescription';
	
	if( typeof( event.title ) == 'undefined' || event.title == null || event.title == "" ){
		event.title = 'Sample Item';
	}
	
	if( typeof( event.location ) == 'undefined' || event.location == null || event.location == "" ){
		event.location = 'Sample Location';
	}
	
	if( typeof( event.description ) == 'undefined' || event.description == null || event.description == "" ){
		event.description = '';
	}
	
	titleContainer.appendChild(document.createTextNode(event.title));
	locationContainer.appendChild(document.createTextNode(event.location));
	descriptionContainer.appendChild(document.createTextNode(event.description));
	
	eventContainer.appendChild( titleContainer );
	eventContainer.appendChild( locationContainer );
	eventContainer.appendChild( descriptionContainer );
	
	render( eventContainer, container );
		
	// Here we create a div that works as an offset. It's sole purpose is to add an additional
	// "margin" to the right of our div. This is to keep symmetry. I admit this is sort of a hack.
	if( typeof( event.addOffset ) !== 'undefined' ){
		var offsetNode = document.createElement('div');
		offsetNode.className = 'offset';
		offsetNode.style.width = this.rightOffset + "px";
		offsetNode.style.position = 'absolute';
		offsetNode.style.top =  eventContainer.style.top;
		offsetNode.style.height = eventContainer.style.height;
		offsetNode.style.height = "30px";
		offsetNode.style.left = (parseInt(eventContainer.style.left) + parseInt(eventContainer.style.width) + 
								this.rightOffset + this.borderSideOffset) + "px";
		offsetNode.style.backgroundColor = this.backgroundColor;
		render( offsetNode, container );
	}	
}
// }}}
// {{{ renderEventBlock
/**
 * Renders a group of events that take place at the same time. 
 * 
 * @return none
 * @param events - a block of events that are to be rendered
 * @param container - the object that the events will be rendered to
 * @param render - a callback that actually renders the events
 */
Calendar.prototype.renderEventBlock = function( events, container, render ){
	var columns = [];
	var columnMaxLength = [0];
	while( events.length > 0 ){
		event = events.shift();
		var newRow = false;
		for( var i = 0; i < columnMaxLength.length; i++ ){
			if( event.start >= columnMaxLength[i] ){
				columnMaxLength[i] = event.end;
				if( typeof( columns[i] ) == 'undefined' ){
					columns[i] = [];
				}
				columns[i].push( event );
				newRow = true;
			}
		}
		if(!newRow){
			columnMaxLength.push( event.end );
			var newIndex = columnMaxLength.length - 1;
			if( typeof( columns[newIndex] ) == 'undefined' ){
				columns[newIndex] = [];
			}
			columns[newIndex].push( event );
		}
	}
	
	for( var i in columns ){
		var width = Math.floor( (this.width / columns.length )  );
		var offset = this.sideOffset + this.borderSideOffset;
		for( var j in columns[i] ){
			if(!columns[i].hasOwnProperty(j)) continue;
			columns[i][j].top = columns[i][j]['start'];
			columns[i][j].width = width - offset;
			columns[i][j].left = width * i + this.leftOffset;
			
			// If we have more than 5 our events get too small, as such we reset the width and add an offset
			// to maintain symmetry. The addOffset property is a bit of a hack but it's simple and works alright.
			// Keep in mind that if we have more than 5 entries we DO NOT re-render the entire event calendar.
			// I do this because going outside of our bounds is (in my mind) an edge case to be avoided AND
			// I wanted to keep the regular flow within our actual contents, not needing to scroll.
			// This was a design decision and is done on purpose.
			if( columns.length > 5 ){
				columns[i][j].width = this.minimumWidth - offset;
				columns[i][j].left = this.minimumWidth * i + offset;
				if( i == (columns.length - 1) ){
					columns[i][j]['addOffset'] = true;
				}	
			}
			this.renderEvent( columns[i][j], container, function( event, container ){
				container.appendChild( event );
			});	
		}
	}
}
// }}}
// {{{ render
/**
 * Renders the event
 *
 * @return none
 * @param none
 */
Calendar.prototype.render = function(){

	var timelineContainer = document.getElementById( this.calendarElem.id + '-timeline' );
	if( timelineContainer === null ){
		timelineContainer = document.createElement('div');
		timelineContainer.id = this.calendarElem.id + '-timeline';
		timelineContainer.className = 'timeline';
		this.calendarElem.appendChild(timelineContainer);
	}else{
		timelineContainer.innerHTML = '';
	}
	
	var eventsContainer = document.getElementById( this.calendarElem.id + '-events' );
	if( eventsContainer === null ){
		eventsContainer = document.createElement('div');
		eventsContainer.id = this.calendarElem.id + '-events';
		eventsContainer.className = 'events';
		eventsContainer.style.position = 'relative';
		this.calendarElem.appendChild( eventsContainer );
	}else{
		eventsContainer.innerHTML = '';
	}
	
	for( var i in this.times ){
		if(!this.times.hasOwnProperty(i)) continue;
		timelineContainer.appendChild(this.renderTime(this.times[i],(i % 2 == 0)));
	}
	
	var j = 0;
	while( j < this.events.length ){
		// In this instance we have no overlap. We can just make it 100% and not care.
		// If we DO have overlap we need to do some extra logic to put a systems of columns into place when rendering our events.
		if((typeof(this.events[j+1]) == 'undefined') || this.events[j]['end'] <= this.events[j+1]['start']){
			this.events[j].width = this.width - this.sideOffset - this.borderSideOffset;
			this.events[j].left = this.leftOffset;
			this.renderEvent(this.events[j], eventsContainer, function( event, container ){
				container.appendChild( event );
			});
			j++; 
			continue;
		}
		
		var stack = [];
		var maxHeight = this.events[j]['end'];
		while( j < ( this.events.length -1 ) && maxHeight > this.events[j+1]['start'] ){
			stack.push( this.events[j] );
			j++;
			if( maxHeight <= this.events[j]['end'] ){
				maxHeight = this.events[j]['end'];
			}
		}
		stack.push( this.events[j] );
		this.renderEventBlock( stack, eventsContainer, function( block, container ){
			container.appendChild( block );
		});
		j++;
	}
}