/**
 * Calendar object
 *
 * @return none
 * @param: Array myEvents - an array of events 
 */
function Calendar( myEvents, myTimeframe, mySettings, renderTo ){
	myEvents.sort(function( left, right ){
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
	this.events = myEvents;
	var timeConfig = this.getTimes( myTimeframe );
	this.times = timeConfig.times;
	this.heightOffset = mySettings.eventPaddingTop + mySettings.eventPaddingBottom;
	this.sideOffset = mySettings.eventPaddingLeft + mySettings.eventPaddingRight;
	this.leftOffset = mySettings.paddingLeft;
	this.rightOffset = mySettings.paddingRight; 
	this.leftBorderOffset = mySettings.eventBorderWidthLeft;
	this.rightBorderOffset = mySettings.eventBorderWidthRight;
	this.topBorderOffset = mySettings.eventBorderWidthTop;
	this.bottomBorderOffset = mySettings.eventBorderWidthBottom;
	this.borderHeightOffset = this.topBorderOffset + this.bottomBorderOffset;
	this.borderSideOffset = this.leftBorderOffset + this.rightBorderOffset;
	this.width = mySettings.width - (this.leftOffset + this.rightOffset);
	console.log( this.width );
	this.render(renderTo);
}

Calendar.prototype.addMinutes = function( date, minutes ){
	return new Date( date.getTime() + minutes * 60 * 1000 );
}

Calendar.prototype.getTimes = function( timeframe ){
	var timeDiff = timeframe.endDateTime - timeframe.startDateTime;
	
	//TODO: Calculate actual time differential
	timeDiff /= 1000; // Number of seconds required.
	timeDiff /= 60; // Number of minutes required.
	var majorTicks = (timeframe.ticks / 2);
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
}

Calendar.prototype.renderEventBlock = function( events, container, render ){
	var columns = [];
	var columnMaxLength = [0];
	var columnTop = events[0].marginTop;
	events[0].marginTop = 0;
	
	var maxLength = 0;
	var minLength = events[0].start;
	
	while( events.length > 0 ){
		event = events.shift();
		if( maxLength < event.end ){
			maxLength = event.end;
		}
		var newRow = false;
		for( var i = 0; i < columnMaxLength.length; i++ ){
			if( event.start > columnMaxLength[i] ){
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
		//var width = Math.floor( (1 / columns.length) * 100 );
		var width = Math.floor( (this.width / columns.length )  );
		var offset = this.sideOffset + this.borderSideOffset;
		for( var j in columns[i] ){
			if(!columns[i].hasOwnProperty(j)) continue;
			columns[i][j].top = columns[i][j]['start'];
			columns[i][j].width = width - offset;
			columns[i][j].left = (width * parseInt(i)) + this.leftOffset;
			this.renderEvent( columns[i][j], container, function( event, container ){
				container.appendChild( event );
			});	
		}
	}
}

Calendar.prototype.render = function( calendarElem ){
	
	var timelineContainer = document.getElementById( calendarElem.id + '-timeline' );
	if( timelineContainer === null ){
		timelineContainer = document.createElement('div');
		timelineContainer.id = calendarElem.id + '-timeline';
		timelineContainer.className = 'timeline';
		calendarElem.appendChild(timelineContainer);
	}else{
		timelineContainer.innerHTML = '';
	}
	
	var eventsContainer = document.getElementById( calendarElem.id + '-events' );
	if( eventsContainer === null ){
		eventsContainer = document.createElement('div');
		eventsContainer.id = calendarElem.id + '-events';
		eventsContainer.className = 'events';
		eventsContainer.style.position = 'relative';
		calendarElem.appendChild( eventsContainer );
	}else{
		eventsContainer.innerHTML = '';
	}
	
	for( var i in this.times ){
		if(!this.times.hasOwnProperty(i)) continue;
		timelineContainer.appendChild(this.renderTime(this.times[i],(i % 2 == 0)));
	}
	
	var j = 0;
	var previousHeight = 0;
	var offset = 0;
	while( j < this.events.length ){
		// In this instance we have no overlap. We can just make it 100% and not care.
		// If we DO have overlap we need to do some extra logic to put a systems of columns into place when rendering our events.
		if((typeof(this.events[j+1]) == 'undefined') || this.events[j]['end'] <= this.events[j+1]['start']){
			this.events[j].marginTop = this.events[j]['start'];
			this.events[j].width = this.width - this.sideOffset - this.borderSideOffset;
			this.events[j].left = this.leftOffset;
			previousHeight = this.events[j]['start'] + previousHeight;
			offset = this.events[j]['start'];
			this.renderEvent(this.events[j], eventsContainer, function( event, container ){
				container.appendChild( event );
			});
			j++; 
			continue;
		}
		
		var stack = [];
		var maxHeight = 0;
		var minHeight = 720;
		var previousOffset = offset;
		//this.events[j]['marginTop'] = this.events[j]['start'] - previousHeight;
		offset = this.events[j]['start'];
		while( j < ( this.events.length -1 ) && ( this.events[j]['end'] ) >= this.events[j+1]['start'] ){
			stack.push( this.events[j] );
			if( this.events[j]['end'] > maxHeight ){
				maxHeight = this.events[j]['end'];
			}
			if( this.events[j]['end'] < minHeight ){
				minHeight = this.events[j]['end'];
			}
			j++;
		}
		if( this.events[j]['end'] > maxHeight ){
			maxHeight = this.events[j]['end'];
		}
		if( this.events[j]['end'] < minHeight ){
			minHeight = this.events[j]['end'];
		}
		this.events[j]['marginTop'] = maxHeight - previousHeight;
		stack.push( this.events[j] );
		previousHeight = minHeight - previousHeight;
		
		this.renderEventBlock( stack, eventsContainer, function( block, container ){
			container.appendChild( block );
		});
		j++;
	}
}