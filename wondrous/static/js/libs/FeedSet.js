/*
    What is a feedset?
    A feed set is a sorted array, that is a capable of the following:
    updating
    adding
    unshifing
    size
*/
var SortedArraySet = require("collections/sorted-array-set");

function FeedSet(currentArray,reverse){
    var r = reverse == true

    this.sortedSet = new SortedArraySet(currentArray,function(a,b){
        return a.id==b.id;
    }, function(a,b){
        if (r){
            if (a.id<b.id){
                return -1
            }else if(a.id>b.id){
                return 1;
            }else{
                return 0;
            }
        }else{
            if (a.id>b.id){
                return -1
            }else if(a.id<b.id){
                return 1;
            }else{
                return 0;
            }
        }
    });
}

FeedSet.prototype.push = function(item){
    this.sortedSet.push(item);
}

FeedSet.prototype.unshift = function(item){
    this.sortedSet.unshift(item);
}

FeedSet.prototype.reset = function(){
    this.sortedSet.clear();
}

FeedSet.prototype.delete = function(item_id){
    var temp = {id:item_id}
    return this.sortedSet.delete(temp);
}

FeedSet.prototype.update = function(item){
    this.sortedSet.delete(temp);

}

module.exports = FeedSet;
