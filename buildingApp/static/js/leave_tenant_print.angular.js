angular.module('yewooApp', [])
    .controller('MainCtrl', function($scope, $timeout) {

        var s = $scope;
        var payments = [];
        var paymentDetails = [];

        // 미납요금 내역 가져오기

        function AdjustPaymentYM(nowym, y, m, type)
        {
            nowy = Number(nowym.split('.')[0].trim());
            nowm = Number(nowym.split('.')[1].trim());
            if (type == 'min') {
                if (y < nowy || (y == nowy && m < nowm))
                    return y+'.'+m;
            }
            else {
                if (y > nowy || (y == nowy && m > nowm))
                    return y+'.'+m;
            }
            return nowym;
        }

        var doAjaxAllList = function() {
            var postData = {};
            var csrftoken = $.cookie('csrftoken');
            postData['csrfmiddlewaretoken'] = csrftoken;
            postData['building_id'] = $("#bid").val();
            postData['resident_id'] = $("#rid").val();
            postData['year'] = new Date().getFullYear();
            postData['month'] = new Date().getMonth() + 1;
            postData['is_empty'] = false;

            $.ajax({
                type : 'POST',
                url : '/lease/payment/detail/getAllInfo/',
                data : postData,
                success : function(result) {
                    var today = Number(new Date().getDate());
                    var thisYear = result[0].year;
                    var thisMonth = result[0].month;
                    var thisNumber = result[0].number;

                    // 연체리스트, 수정사항리스트 두 가지로 분리하기
                    for (i = 0; i < result.length; i++) {
                        if (result[i].type == 'basic') {
                            // 만약 이번 달 납부 내역이 아직 납부일 전이거나 완납한 경우에는 '이번 달 리스트'에 따로 담아야 한다.
                            if (result[i].number == thisNumber && 
                                (today <= Number(result[i].leasePayDate) || (result[i].payStatus == -1 && result[i].payDateDay <= Number(result[i].leasePayDate))) ) {
                                while (result[i].number == thisNumber) {
                                    result[i].isThis = Number(1);
                                    payments_thisMonth.push(result[i]);
                                    payments.push(result[i]);
                                    i++;
                                }
                                i--;
                            }
                            else {
                                result[i].isThis = Number(0);
                                payments.push(result[i]);
                            }
                        }
                        else 
                            paymentDetails.push(result[i]); 
                    }

                    // 미납 년/월 범위 구하기, 현재 미납 달 횟수 구하기
                    var minym = '9999.12', maxym = '0.0', payCnt = 0;
                    var totalAmountNoPay = 0;
                    for (i = 0; i < payments.length; i++) {
                        if (payments[i].payStatus != -1 && payments[i].isThis == 0) {
                            // 직전 항목과 고지회차가 다를 때만 미납액/연체료 계산을 해야 한다.
                            if (i == 0 || Number(payments[i-1].number) != Number(payments[i].number)) {
                                minym = AdjustPaymentYM(minym, payments[i].year, payments[i].month, 'min');
                                maxym = AdjustPaymentYM(maxym, payments[i].year, payments[i].month, 'max');
                                payCnt++;
                                totalAmountNoPay += Number(payments[i].amountNoPay);
                            }
                        }
                    }
                    if (minym == '9999.12') minym = '없음';
                    if (maxym == '0.0') maxym = '없음';
            
                    /*
                    [
                        { checked: false, amount: 10000, month: "2014/03", time: 10, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 10000 },
                        { checked: false, amount: 20000, month: "2013/03", time: 11, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 20000 },
                        { checked: false, amount: 30000, month: "2012/03", time: 12, paidDate: new Date(), expectedDate: new Date(), revisiedAmount: 30000 }
                    ]
                    */
                    
                    var cases = [];
                    var lastPayment = null;
                    
                    for (var i = 0; i < payments.length; i++) {
                        var payment = payments[i];
                        //if (payment.isThis == 1 || payment.payStatus == -1) continue;
                        payment.amount = payment.amountNoPay;
                        payment.revisiedAmount = payment.amountNoPay;
                        payment.expectedDate = new Date(payment.year, payment.month);
                        payment.isPaid = payment.payStatus == -1 || (i > 0 && payment.number == payments[i - 1].number);
                        
                        cases.push(payment);
                    }

                    s.$apply(function () {
                        s.cases = cases;
                    });
                    
                    // 납부 상세 리스트 보여주기
                    //var template = new EJS({url : '/static/ejs/03_03_payment_detail_tab1_list.ejs'}).render({'data' : payments, 'minym' : minym, 'maxym' : maxym, 'payCnt' : payCnt, 'totalAmountNoPay' : totalAmountNoPay});
                    //$('#payment_list').html(template);
                },

                error : function(msg) {
                    alert('데이터를 로딩하지 못했습니다...\n페이지 새로고침을 해 보시기 바랍니다.');
                },
            });
        }

        doAjaxAllList();

        s.mode = 2;

        s.today = new Date();

        // 총 반환금 section
        s.deposit = 0; // 보증금
        s.unpaid = 0; // 미납요금 및 공과금
        s.fee = 0; // 시설관리비
        s.totalRefund= 0; // 반환금
        s.bank = ""; // 은행
        s.account = ""; // 계좌번호

        s.unpaidClosed = false;

        // MoneyChanges
        s.moneyChangeTypes = [ 
            { id:1, title: "선불제", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
            { id:2, title: "임대계약금", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
            { id:3, title: "중도금", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
            { id:4, title: "임대 보증금 잔금", subTypes: [ "입금", "입금대기", "출금", "출금대기", "입금완료", "출금완료" ], hasDate: true, amount: 0 },
        ];

        s.updateMoneyChangeType = function() {
            if (!s.moneyChange.type.subTypes) { s.moneyChange.subType = null; }
            else { s.moneyChange.subType = s.moneyChange.type.subTypes[0]; }
            if (!s.moneyChange.type.hasMonth) { s.moneyChange.month = null; }
            else { s.moneyChange.month = new Date().getMonth() + 1; } 
            if (!s.moneyChange.type.hasYear) { s.moneyChange.year = null; }
            else { s.moneyChange.year = new Date().getFullYear(); } 
            s.moneyChange.amount = s.moneyChange.type.amount;
            s.moneyChange.date = new Date().getFullYear() + "." + (new Date().getMonth() + 1) + "." + (new Date().getDate());
        }

        var moneyChangeType = s.moneyChangeTypes[0];
        s.moneyChange = { type: moneyChangeType, desc: "", amount: 0 };

        s.updateMoneyChangeType();

        s.moneyChanges = [];

        s.addMoneyChange = function(cost) {
            s.moneyChanges.push({
                type: cost.type,
                desc: cost.desc,
                amount: cost.amount,
                subType: cost.subType,
                month: cost.month,
                year: cost.year,
                date: $(".datepicker").val(),
                checked: true
            });
        }

        s.removeMoneyChange = function(cost) {
            s.moneyChanges = _.filter(s.moneyChanges, function(a) { return a != cost; });
        }

        // Records
        s.recordTypes = [ 
            { id:1, title: "전기", amount: 0 },
            { id:2, title: "수도", amount: 0 },
            { id:3, title: "가스", amount: 0 }
        ];

        s.updateRecordType = function() {
            if (!s.record.type.subTypes) { s.record.subType = null; }
            else { s.record.subType = s.record.type.subTypes[0]; }
            if (!s.record.type.hasMonth) { s.record.month = null; }
            else { s.record.month = new Date().getMonth() + 1; } 
            if (!s.record.type.hasYear) { s.record.year = null; }
            else { s.record.year = new Date().getFullYear(); } 
            s.record.amount = s.record.type.amount;
        }

        var recordType = s.recordTypes[0];
        s.record = { type: recordType, desc: "", amount: 0 };

        s.updateRecordType();

        s.records = [];

        s.addRecord = function(cost) {
            s.records.push({
                type: cost.type,
                desc: cost.desc,
                amount: cost.amount,
                subType: cost.subType,
                month: cost.month,
                year: cost.year,
                checked: true
            });
        }

        s.removeRecord = function(cost) {
            s.records = _.filter(s.records, function(a) { return a != cost; });
        }

        // 퇴거 정산 내역 
        s.allListClosed = false;
        
        // 퇴거 반환금 
        s.updateTotalRefund = function () {
            s.totalRefund = s.deposit - s.unpaid - s.fee;
            s.isMinusTotalRefund = s.totalRefund < 0;
        };

        s.isTotalRefundNegative = function() {
            return s.totalRefund < 0;
        };

        s.updateTotalRefund();
              
    });