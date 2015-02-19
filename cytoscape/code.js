var cy;
$(function(){ // on dom ready

var cyto = cytoscape({
  container: document.getElementById('cy'),
  
  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector: '$node > node',
      css: {
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
        'text-valign': 'top',
        'text-halign': 'center'
      }
    },
    {
      selector: 'edge',
      css: {
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: ':selected',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    }
  ],
  
  layout: {
    name: 'cose',
    padding: 5
  }
});

cy = $('#cy').cytoscape('get');

$.couch.urlPrefix = "http://common.bwh.harvard.edu:5984";

// Studies
$.couch.db("chronicle").view("instances/context", {
  reduce : true,
  group_level : 2,
  success: function(data) {
    // add tree entries for each hit
    $.each(data.rows, function(index,row) {
      var institution = row.key[0][0];
      var patientUID = String(row.key[0]);
      var patientID = row.key[0][1];
      var studyDescription = row.key[1][0];
      var studyUID = row.key[1][1];
      var noDotsStudyID = studyUID.replace(/\./g, '_');
      var cyStudyID = '#' + noDotsStudyID;
      var seriesCount = row.value;
      if ( cy.$(cyStudyID).length == 0 ) {
        cy.add({
          group : "nodes",
          data : { id : noDotsStudyID, weight : 100 },
          position : { x : 20, y : 20 }
        });
      }
    });
    cy.layout({name: "grid"});
  }
});

function fetchStudyEdge(id) {
  $.couch.db("chronicle").openDoc(id, {
    success : function(data) {
      var noDotsID = id.replace(/\./g, '_');
      studyUID = data.dataset['0020000D'].Value;
      var noDotsStudyID = studyUID.replace(/\./g, '_');
      cy.add({
        group : "edges",
        data : { id : noDotsID+'_to_'+noDotsStudyID, source : noDotsID, target : noDotsStudyID},
      });

      console.log(data.dataset['0020000D']);
    },
    error : function(status) {
      console.log(status);
    }
  });
};

var value = "Slicer Study Render";
$.couch.db("chronicle").view("tags/byTagAndValue", {
  startkey: ["0008103E", value],
  endkey: ["0008103E", value+"\u9999"],
  reduce : false,
  stale : 'update_after',
  //limit : 30,
  success: function(data) {
    $.each(data.rows, function(index,row) {
      var id = row.id;
      var imageURL = 'http://common.bwh.harvard.edu:5984/chronicle/' + id + '/image.jpg';
      var group = "nodes";
      var noDotsID = id.replace(/\./g, '_');
      var cyID = '#' + noDotsID;
      cy.add({
          group: group,
          data: { id: noDotsID, weight: 75 },
          position: { x: 200, y: 200 }
      });
      cy.$(cyID).css('shape', 'rectangle');
      /*
      cy.$(cyID).css('background-image', imageURL);
      cy.$(cyID).css('width', '1200px');
      cy.$(cyID).css('height', '1200px');
      */
      fetchStudyEdge(id);
    });
    cy.layout({name: "grid"});
  },
});

}); // on dom ready
