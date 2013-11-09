/** 
 * A pub/sub which is responsible for a single event type
 * 
 * @param {String} eventType                   the name of the events managed by this singleEventPubSub
 * @param {singleEventPubSub} [newListener]    place to notify of new listeners
 * @param {singleEventPubSub} [removeListener] place to notify of when listeners are removed
 */
function singleEventPubSub(eventType, newListener, removeListener){

   var listeners;

   function hasId(id){
      return function(tuple) {
         return tuple.id == id;      
      };  
   }
              
   return {

      /**
       * @param {Function} listener
       * @param {*} listenerId 
       *    an id that this listener can later by removed by. 
       *    Can be of any type, to be compared to other ids using ==
       */
      on:function( listener, listenerId ) {
         
         var tuple = {
            listener: listener
         ,  id:       listenerId || listener // when no id is given use the
                                             // listener function as the id
         };

         if( newListener ) {
            newListener.emit(eventType, listener, tuple.id);
         }
         
         listeners = cons( tuple, listeners );

         return this; // chaining
      },
     
      emit:function () {      
         var parameters = arguments;
                                                                                                                              
         applyEach( 
            function (tuple) {                  
               tuple.listener.apply(null, parameters);               
            }, 
            listeners
         );
      },
      
      un: function( listenerId ) {
             
         var removed;             
              
         listeners = without(
            listeners,
            hasId(listenerId),
            function(tuple){
               removed = tuple;
            }
         );    
         
         if( removeListener && removed ) {
            removeListener.emit(eventType, removed.listener, removed.id);
         }
      },
      
      listeners: function(){
         // differs from Node EventEmitter: returns list, not array
         return map(attr('listener'), listeners);
      },
      
      hasListener: function(listenerId){
         var test = listenerId? hasId(listenerId) : always;
      
         return defined(first( test, listeners));
      }
   };
}