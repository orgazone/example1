if (!window.orga) {
    window.orga = {
        registerApp: function() {
            var that = this;
            var date = new Date();
            var uniqueId = date.getFullYear() + "" + date.getMonth() + "" + date.getDate() + "" + date.getHours();
            uniqueId += date.getMinutes() + "" + date.getSeconds() + "-" + Math.floor((Math.random() * 1000) + 1);
            that.database.storeRegId(uniqueId);
        },
        /**
         * Date time picker section
         */
        selectedDate: null,

        dateTimePicker: {
            init: function(timestamp) {
                var today;
                var currentValueDate, currentValueTime;
                if (timestamp != undefined) {
                    today = new Date(timestamp);
                    //currentValueDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
                    currentValueDate = today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();
                    currentValueTime = today.getHours() + ":" + today.getMinutes();
                } else {
                    today = new Date();
                    //currentValueDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
                    currentValueDate = today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();
                    currentValueTime = today.getHours() + ":" + today.getMinutes();
                }



                //Date picker init
                $('#dateTimeNote').datetimepicker({
                    format: 'Y/m/d H:i',
                    formatDate: 'Y/m/d',
                    dayOfWeekStart: 1,
                    lang: 'en',
                    startDate: currentValueDate,
                    value: currentValueDate + " " + currentValueTime,
                    step: 10,
                    onChangeDateTime: function(dp, $input) {
                        orga.selectedDate = dp;
                    }
                });
            },
        },

        //Form validation before saving
        validateForm: function(timestamp, title, message) {

            if (timestamp == null || title.trim() == "" || message.trim() == "") {
                alert('Please enter complete form.');
                return false;
            }

            return true;
        },

        //Method to render the list of saved entries
        renderList: function() {
            var that = this;
            var data = that.database.notesDataArray;
            //Empty list
            $(".listContainer").html("");

            if (data.data.length > 0) {
                $.ajax({
                    url: "views/list_item.tmpl.html",
                    success: function(source) {
                        template = Handlebars.compile(source);
                        $(".listContainer").html(template(data));
                        $(".listContainer").listview("refresh");
                        $("body").trigger("create");
                    },
                    async: false
                });
            } else {
                //No data in the list, hide the clear all button
                $("#clearAllData").hide();
                $("#clearAllData").hide();
            }

        },

        //Method to delete 
        deleteItem: function(id) {
            var that = this;
            var index = that.database.getItemIndex(id);
            if (index != -1) {
                that.database.notesDataArray.data.splice(index, 1);
                that.database.saveData();
            }

            app.changePage("listPage");
        },

        /**
         * Database Object
         */
        database: {
            IS_DATABASE_PRESENT: "is_db_present",

            CONTENT_DATA: "content_data",

            REG_ID_KEY: "reg_id",

            notesDataArray: {
                data: []
            },

            noteDataFormat: {
                id: null,
                timeStamp: null,
                title: null,
                notes: null
            },

            init: function() {
                var that = this;
                if (that.getLocalItem(that.IS_DATABASE_PRESENT)) {
                    that.notesDataArray = that.getLocalItem(that.CONTENT_DATA);
                }
            },

            storeRegId: function(id) {
                var that = this;
                var fetchedId = that.getLocalItem(that.REG_ID_KEY);
                if (fetchedId) {
                    config.appId = fetchedId;
                } else {
                    that.setLocalItem(that.REG_ID_KEY, id);
                    config.appId = id;
                }
            },

            saveData: function() {
                var that = this;
                that.setLocalItem(that.CONTENT_DATA, that.notesDataArray);
            },

            saveNewNote: function(timeStamp, title, notes, previousId) {
                var that = this;
                var note = (JSON.parse(JSON.stringify(that.noteDataFormat)));
                note.id = new Date().getTime();
                note.timeStamp = timeStamp;
                note.title = title;
                note.notes = notes;

                if (previousId == undefined) {
                    that.notesDataArray.data.push(note);
                } else {
                    //old entry so update it
                    note.id = previousId;
                    that.notesDataArray.data[that.getItemIndex(previousId)] = note;
                }


                //Save data
                that.saveData();
            },

            clearSavedNotes: function() {
                var that = this;
                that.notesDataArray.data = [];
                that.setLocalItem(that.IS_DATABASE_PRESENT, false);
                //Save data
                that.saveData();
            },

            getLocalItem: function(key) {
                var that = this;
                if (key === that.IS_DATABASE_PRESENT || key === that.REG_ID_KEY) {
                    return window.localStorage.getItem(key, false);
                } else {
                    return JSON.parse(window.localStorage.getItem(key));
                }

            },

            setLocalItem: function(key, value) {
                var that = this;
                try {
                    if (key === that.CONTENT_DATA) {
                        window.localStorage.setItem(that.IS_DATABASE_PRESENT, true);
                        window.localStorage.setItem(key, JSON.stringify(value));
                    } else {
                        window.localStorage.setItem(key, value);
                    }
                } catch (e) {
                    alert("We had an issue saving the data locally..");
                }

            },

            getItemIndex: function(id) {
                var that = this;
                for (i = 0; i < that.notesDataArray.data.length; i++) {
                    if (that.notesDataArray.data[i]['id'] == id) { //DO not use === as local store saved everything as strings
                        return i;
                    }
                }
                return -1;
            },

        },
    };
};
