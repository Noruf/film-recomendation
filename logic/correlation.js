var Rating = require('../models/rating');
var Correlation = require('../models/rating');

//calculates stats needed for Pearson Corellation
function calcStats(arr){
  stats={sum1:0,sum2:0,sumProducts:0, n:arr.length, sumsq1:0, sumsq2:0};
  for (let i=0;i<arr.length;i++){
    stats.sum1+=arr[i][0];
    stats.sum2+=arr[i][1];
    stats.sumsq1+=arr[i][0]*arr[i][0];
    stats.sumsq2+=arr[i][1]*arr[i][1];
    stats.sumProducts+=arr[i][0]*arr[i][1];
  }
  stats.avg1 = stats.sum1/stats.n;
  stats.avg2 = stats.sum2/stats.n;
  return stats;
}

//look for film ratings of both users
function getRatings(userID1,userID2){
  Rating.find({_id:userID1},function(err,ratings1){
    Rating.find({_id:userID2},function(err,ratings2){
      let r = calculateCorelation(ratings1,ratings2)
      Correlation.findOne({usersID:{ $all:[userID1,userID2] }},function(err,cor){
        if(cor){
          cor.r = r;
        }else{
          cor = new Correlation({
            usersID:[userID1,userID2],
            r:r
          });
        }
        Correlation.save(cor,function(err,correl){
          if(err){
            console.log(err);
          }
        });
      });
    });
  });
}

//calculate Pearson Corellation
function calculateCorrelation(ratings1,ratings2){
  let ratings=[];
  for(let i=0;i<ratings1.length;i++){
    let r2 = ratings2.find(x => x.filmID == ratings1[i].filmID);
    if(r2){
      ratings.push([ratings1[i].rating, r2.rating]);
    }
  }
  if (ratings.length<5) return undefined;
  let stats = calcStats(ratings);

  let r = (stats.sumProducts - stats.n * stats.avg1 * stats.avg2)/
          (sqrt(stats.sumsq1-stats.n*stats.avg1*stats.avg1)*
          sqrt(stats.sumsq2-stats.n*stats.avg2*stats.avg2));

  return r?r:0;
}
